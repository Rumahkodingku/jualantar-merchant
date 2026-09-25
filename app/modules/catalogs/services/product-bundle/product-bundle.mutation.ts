import { useCallback, useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { putToStorage } from "~/lib/api"

import { catalogRepository } from "../catalog.repository"
import { invalidateProducts } from "../catalog.invalidation"
import type {
    MediaUploadTarget,
    ModifierCreateInput,
    ModifierGroupCreateInput,
    ProductCreateInput,
    VariantCreateInput,
} from "../../types/catalog.types"

export type BundleStepKey = "product" | "variants" | "customization" | "media" | "outlets"

export type BundleStepStatus = "pending" | "running" | "success" | "skipped" | "failed"

export interface BundleStep {
    key: BundleStepKey
    label: string
    status: BundleStepStatus
    error: unknown
}

export interface ProductBundleMediaInput {
    file: File
    alt_text: string | null
    is_primary: boolean
}

export interface ProductBundleInput {
    product: ProductCreateInput
    variants: VariantCreateInput[]
    modifierGroups: Array<{
        group: ModifierGroupCreateInput
        modifiers: ModifierCreateInput[]
    }>
    media: ProductBundleMediaInput[]
    outletIds: string[]
}

const BUNDLE_STEPS: Array<{ key: BundleStepKey; label: string }> = [
    { key: "product", label: "Produk" },
    { key: "variants", label: "Variant" },
    { key: "customization", label: "Customization" },
    { key: "media", label: "Media" },
    { key: "outlets", label: "Outlet" },
]

function isEmptyStep(key: BundleStepKey, input: ProductBundleInput): boolean {
    if (key === "variants") {
        return input.variants.length === 0
    }

    if (key === "customization") {
        return input.modifierGroups.length === 0
    }

    if (key === "media") {
        return input.media.length === 0
    }

    if (key === "outlets") {
        return input.outletIds.length === 0
    }

    return false
}

function createBundleSteps(input?: ProductBundleInput): BundleStep[] {
    return BUNDLE_STEPS.map(({ key, label }) => ({
        key,
        label,
        status: input !== undefined && isEmptyStep(key, input) ? "skipped" : "pending",
        error: null,
    }))
}

export function useCreateProductBundle() {
    const queryClient = useQueryClient()
    const [steps, setSteps] = useState<BundleStep[]>(createBundleSteps)
    const [productId, setProductId] = useState<string | null>(null)

    const lastInput = useRef<ProductBundleInput | null>(null)
    const createdProductId = useRef<string | null>(null)
    const createdVariants = useRef(0)
    const createdGroupIds = useRef<string[]>([])
    const createdModifierCounts = useRef<number[]>([])
    const uploadedMedia = useRef<Array<MediaUploadTarget | undefined>>([])

    const mark = useCallback((key: BundleStepKey, status: BundleStepStatus, error: unknown = null) => {
        setSteps((current) => current.map((step) => (step.key === key ? { ...step, status, error } : step)))
    }, [])

    const mutation = useMutation({
        mutationFn: async ({ input, retryKeys }: { input: ProductBundleInput; retryKeys: BundleStepKey[] | null }) => {
            const shouldRun = (key: BundleStepKey) => retryKeys === null || retryKeys.includes(key)
            let activeProductId = createdProductId.current

            if (shouldRun("product")) {
                mark("product", "running")

                try {
                    const product = await catalogRepository.products.create(input.product)

                    activeProductId = product.id
                    createdProductId.current = product.id
                    setProductId(product.id)
                    mark("product", "success")
                } catch (error) {
                    mark("product", "failed", error)
                    throw error
                }
            }

            if (activeProductId === null) {
                throw new Error("Produk belum dibuat.")
            }

            const targetProductId = activeProductId

            if (shouldRun("variants") && input.variants.length > 0) {
                mark("variants", "running")

                try {
                    for (const [index, variant] of input.variants.entries()) {
                        if (index < createdVariants.current) {
                            continue
                        }

                        await catalogRepository.variants.create(targetProductId, variant)
                        createdVariants.current = index + 1
                    }

                    mark("variants", "success")
                } catch (error) {
                    mark("variants", "failed", error)
                    throw error
                }
            }

            if (shouldRun("customization") && input.modifierGroups.length > 0) {
                mark("customization", "running")

                try {
                    for (const [index, entry] of input.modifierGroups.entries()) {
                        let groupId = createdGroupIds.current[index]

                        if (groupId === undefined) {
                            const group = await catalogRepository.modifierGroups.create(targetProductId, entry.group)

                            groupId = group.id
                            createdGroupIds.current[index] = groupId
                        }

                        for (const [position, modifier] of entry.modifiers.entries()) {
                            if (position < (createdModifierCounts.current[index] ?? 0)) {
                                continue
                            }

                            await catalogRepository.modifiers.create(targetProductId, groupId, modifier)
                            createdModifierCounts.current[index] = position + 1
                        }
                    }

                    mark("customization", "success")
                } catch (error) {
                    mark("customization", "failed", error)
                    throw error
                }
            }

            if (shouldRun("media") && input.media.length > 0) {
                mark("media", "running")

                try {
                    for (const [index, item] of input.media.entries()) {
                        let target = uploadedMedia.current[index]

                        if (target === undefined) {
                            target = await catalogRepository.media.createUploadUrl(targetProductId, {
                                file_name: item.file.name,
                                mime_type: item.file.type,
                                file_size: item.file.size,
                            })
                            await putToStorage(target.upload_url, item.file, { headers: target.headers })
                            uploadedMedia.current[index] = target
                        }

                        await catalogRepository.media.create(targetProductId, {
                            object_key: target.object_key,
                            is_primary: item.is_primary,
                            alt_text: item.alt_text,
                        })
                    }

                    mark("media", "success")
                } catch (error) {
                    mark("media", "failed", error)
                    throw error
                }
            }

            if (shouldRun("outlets") && input.outletIds.length > 0) {
                mark("outlets", "running")

                try {
                    await catalogRepository.productOutlets.replace(targetProductId, input.outletIds)
                    mark("outlets", "success")
                } catch (error) {
                    mark("outlets", "failed", error)
                    throw error
                }
            }

            return targetProductId
        },
        onSuccess: (finishedProductId) => {
            invalidateProducts(queryClient, finishedProductId)
        },
    })

    const failedKeys = steps.filter((step) => step.status === "failed").map((step) => step.key)

    function start(input: ProductBundleInput) {
        lastInput.current = input
        createdProductId.current = null
        createdVariants.current = 0
        createdGroupIds.current = []
        createdModifierCounts.current = []
        uploadedMedia.current = []
        setSteps(createBundleSteps(input))
        setProductId(null)
        mutation.mutate({ input, retryKeys: null })
    }

    function retry() {
        const input = lastInput.current

        if (input === null || failedKeys.length === 0) {
            return
        }

        mutation.mutate({ input, retryKeys: failedKeys })
    }

    return {
        start,
        retry,
        steps,
        productId,
        failedKeys,
        hasFailure: failedKeys.length > 0,
        isPending: mutation.isPending,
    }
}
