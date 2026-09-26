import { useCallback, useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { catalogRepository } from "../catalog.repository"
import { invalidateProducts } from "../catalog.invalidation"
import type {
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
    object_key: string
    alt_text: string | null
    is_primary: boolean
}

/**
 * How far the sequential create got. Persisted with the wizard draft so a retry
 * after a reload resumes instead of creating a second product, a duplicate
 * variant, or a duplicate media row.
 */
export interface BundleProgress {
    productId: string | null
    createdVariants: number
    createdGroupIds: string[]
    createdModifierCounts: number[]
    createdMedia: number
    outletsReplaced: boolean
}

const EMPTY_PROGRESS: BundleProgress = {
    productId: null,
    createdVariants: 0,
    createdGroupIds: [],
    createdModifierCounts: [],
    createdMedia: 0,
    outletsReplaced: false,
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

/** The steps a set of persisted cursors already settled. */
function settledSteps(progress: BundleProgress): Record<BundleStepKey, boolean> {
    return {
        product: progress.productId !== null,
        variants: progress.createdVariants > 0,
        customization: progress.createdGroupIds.length > 0,
        media: progress.createdMedia > 0,
        outlets: progress.outletsReplaced,
    }
}

/**
 * The step list a reloaded wizard opens with: whatever the cursors settled reads
 * as done, everything else is still owed. Without this the status panel would
 * claim nothing had been saved yet and offer no way to carry on. Which of the
 * remaining steps are genuinely empty is only known once the form is in hand, so
 * that is refined when a retry starts.
 */
function restoredBundleSteps(progress: BundleProgress): BundleStep[] {
    const done = settledSteps(progress)

    return BUNDLE_STEPS.map(({ key, label }) => ({
        key,
        label,
        status: done[key] ? "success" : "pending",
        error: null,
    }))
}

/** True when a step still owes work, whether it failed or was never started. */
function isOwed(step: BundleStep): boolean {
    return step.status !== "success" && step.status !== "skipped"
}

export function useCreateProductBundle(initialProgress?: BundleProgress | null) {
    const queryClient = useQueryClient()
    const [steps, setSteps] = useState<BundleStep[]>(() => restoredBundleSteps(initialProgress ?? EMPTY_PROGRESS))
    const [productId, setProductId] = useState<string | null>(initialProgress?.productId ?? null)

    const lastInput = useRef<ProductBundleInput | null>(null)
    const createdProductId = useRef<string | null>(initialProgress?.productId ?? null)
    const createdVariants = useRef(initialProgress?.createdVariants ?? 0)
    const createdGroupIds = useRef<string[]>(initialProgress?.createdGroupIds ?? [])
    const createdModifierCounts = useRef<number[]>(initialProgress?.createdModifierCounts ?? [])
    const createdMedia = useRef(initialProgress?.createdMedia ?? 0)
    const outletsReplaced = useRef(initialProgress?.outletsReplaced ?? false)

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
                        if (index < createdMedia.current) {
                            continue
                        }

                        await catalogRepository.media.create(targetProductId, {
                            object_key: item.object_key,
                            is_primary: item.is_primary,
                            alt_text: item.alt_text,
                        })

                        createdMedia.current = index + 1
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
                    if (!outletsReplaced.current) {
                        await catalogRepository.productOutlets.replace(targetProductId, input.outletIds)
                        outletsReplaced.current = true
                    }

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
    const pendingKeys = steps.filter(isOwed).map((step) => step.key)

    function start(input: ProductBundleInput) {
        lastInput.current = input
        createdProductId.current = null
        createdVariants.current = 0
        createdGroupIds.current = []
        createdModifierCounts.current = []
        createdMedia.current = 0
        outletsReplaced.current = false
        setSteps(createBundleSteps(input))
        setProductId(null)
        mutation.mutate({ input, retryKeys: null })
    }

    /**
     * A snapshot of the cursors, for persisting alongside the draft. Reading the
     * refs directly during render would be a torn read, so the page persists
     * this from an effect that reacts to the step list instead.
     */
    function progress(): BundleProgress {
        return {
            productId: createdProductId.current,
            createdVariants: createdVariants.current,
            createdGroupIds: [...createdGroupIds.current],
            createdModifierCounts: [...createdModifierCounts.current],
            createdMedia: createdMedia.current,
            outletsReplaced: outletsReplaced.current,
        }
    }

    /**
     * Continue an interrupted create.
     *
     * The caller passes the form as it stands now, so edits made after the
     * failure are included and the hook does not have to remember the input
     * across a reload. Only the steps still owed are run, which is what makes a
     * retry after a refresh idempotent instead of duplicating the product.
     */
    function retry(input?: ProductBundleInput) {
        const target = input ?? lastInput.current

        if (target === null) {
            return
        }

        lastInput.current = target

        if (pendingKeys.length === 0) {
            return
        }

        // Steps the cursors settled stay settled; the rest are re-labelled now
        // that the form is available, so empty ones read as skipped instead of
        // pending.
        setSteps(
            restoredBundleSteps(progress()).map((step) => ({
                ...step,
                status: isEmptyStep(step.key, target) ? "skipped" : step.status,
            }))
        )
        mutation.mutate({ input: target, retryKeys: pendingKeys })
    }

    return {
        start,
        retry,
        progress,
        pendingKeys,
        steps,
        productId,
        failedKeys,
        hasFailure: failedKeys.length > 0,
        isPending: mutation.isPending,
        hasStarted: productId !== null || steps.some((step) => step.status !== "pending"),
    }
}
