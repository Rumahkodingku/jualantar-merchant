import { useCallback, useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { invalidateProducts } from "../catalog.invalidation"
import * as mediaApi from "../media/media.api"
import * as modifierApi from "../modifiers/modifier.api"
import * as productApi from "../products/product.api"
import * as productOutletApi from "../product-outlets/product-outlet.api"
import * as variantApi from "../variants/variant.api"
import type { BundleStep, BundleStepKey, BundleStepStatus } from "../product-bundle/product-bundle.mutation"
import type { EditPlan } from "./edit-plan.types"
import { isModifierGroupEmpty } from "./edit-plan.types"
import type { CatalogStatus } from "../../types"

/**
 * The steps an edit breaks into, in the order they have to run. The labels match
 * the create bundle's so the status panel reads the same on both screens.
 */
const EDIT_STEPS: Array<{ key: BundleStepKey; label: string }> = [
    { key: "product", label: "Produk" },
    { key: "variants", label: "Variant" },
    { key: "customization", label: "Customization" },
    { key: "media", label: "Media" },
    { key: "outlets", label: "Outlet" },
]

function initialSteps(plan: EditPlan): BundleStep[] {
    return EDIT_STEPS.map(({ key, label }) => ({
        key,
        label,
        status: isStepEmpty(key, plan) ? "skipped" : "pending",
        error: null,
    })) satisfies BundleStep[]
}

function isStepEmpty(key: BundleStepKey, plan: EditPlan): boolean {
    if (key === "product") {
        return plan.product === null
    }

    if (key === "variants") {
        return (
            plan.variants.create.length === 0 &&
            plan.variants.update.length === 0 &&
            plan.variants.remove.length === 0 &&
            plan.variants.reorder === null
        )
    }

    if (key === "customization") {
        const groups = plan.customization.groups

        return (
            groups.create.length === 0 &&
            groups.remove.length === 0 &&
            groups.reorder === null &&
            groups.update.every(
                (group) =>
                    Object.keys(group.update).length === 0 &&
                    group.status === null &&
                    isModifierGroupEmpty(group.modifiers)
            )
        )
    }

    if (key === "media") {
        return (
            plan.media.create.length === 0 &&
            plan.media.remove.length === 0 &&
            plan.media.primaryId === null &&
            plan.media.reorder === null
        )
    }

    return plan.outlets.replace === null
}

function isOwed(step: BundleStep): boolean {
    return step.status !== "success" && step.status !== "skipped"
}

/**
 * The work of one step, flattened into a list of calls that can be taken one at
 * a time.
 *
 * A create only ever adds, so its steps are safe to restart. An edit does not:
 * re-running a step from the top would create a second copy of a row the first
 * attempt already created, and try to delete a row it already deleted. Turning
 * each step into an explicit list is what makes a retry resumable — the cursor
 * knows how far the step got, and the retry starts from there.
 *
 * The order is not arbitrary. Within a step it is: change what changed, add what
 * is new, remove what is gone, then reorder. Across the step that removes things,
 * an option is deleted before the group holding it, because deleting the group
 * takes its options with it and would remove rows the plan meant to keep.
 */
function buildOperations(productId: string, plan: EditPlan): Record<BundleStepKey, Array<() => Promise<void>>> {
    const product: Array<() => Promise<void>> = []

    if (plan.product !== null) {
        const input = plan.product

        product.push(() => productApi.updateProduct(productId, input).then(() => undefined))
    }

    const variants: Array<() => Promise<void>> = []

    for (const variant of plan.variants.update) {
        const id = variant.id
        const status = variant.status

        variants.push(() => variantApi.updateProductVariant(productId, id, variant.update).then(() => undefined))

        if (status !== null) {
            variants.push(() => setVariantStatus(productId, id, status))
        }
    }

    for (const variant of plan.variants.create) {
        variants.push(async () => {
            const created = await variantApi.createProductVariant(productId, variant)

            // A new default is the first one the API will have stored, so it has
            // to be set explicitly or the product would have two defaults.
            if (variant.is_default) {
                await variantApi.updateProductVariant(productId, created.id, { is_default: true })
            }
        })
    }

    for (const id of plan.variants.remove) {
        variants.push(() => variantApi.deleteProductVariant(productId, id))
    }

    if (plan.variants.reorder !== null) {
        const items = plan.variants.reorder

        variants.push(() => variantApi.reorderProductVariants(productId, items))
    }

    const customization: Array<() => Promise<void>> = []
    const groups = plan.customization.groups

    for (const group of groups.update) {
        const groupId = group.id
        const groupStatus = group.status

        if (Object.keys(group.update).length > 0) {
            const input = group.update

            customization.push(() =>
                modifierApi.updateProductModifierGroup(productId, groupId, input).then(() => undefined)
            )
        }

        if (groupStatus !== null) {
            customization.push(() => setGroupStatus(productId, groupId, groupStatus))
        }
    }

    for (const group of groups.update) {
        const groupId = group.id

        for (const modifier of group.modifiers.update) {
            const modifierId = modifier.id
            const modifierStatus = modifier.status

            customization.push(() =>
                modifierApi.updateProductModifier(productId, groupId, modifierId, modifier.update).then(() => undefined)
            )

            if (modifierStatus !== null) {
                customization.push(() => setModifierStatus(productId, groupId, modifierId, modifierStatus))
            }
        }

        for (const modifier of group.modifiers.create) {
            customization.push(() =>
                modifierApi.createProductModifier(productId, groupId, modifier).then(() => undefined)
            )
        }
    }

    for (const group of groups.create) {
        customization.push(async () => {
            const created = await modifierApi.createProductModifierGroup(productId, group.group)

            for (const modifier of group.modifiers) {
                await modifierApi.createProductModifier(productId, created.id, modifier)
            }
        })
    }

    // Removals, options before the groups that hold them.
    for (const group of groups.update) {
        for (const id of group.modifiers.remove) {
            customization.push(() => modifierApi.deleteProductModifier(productId, group.id, id))
        }
    }

    for (const id of groups.remove) {
        customization.push(() => modifierApi.deleteProductModifierGroup(productId, id))
    }

    // Reordering last, so no payload names a row that has just been removed.
    if (groups.reorder !== null) {
        const items = groups.reorder

        customization.push(() => modifierApi.reorderProductModifierGroups(productId, items))
    }

    for (const group of groups.update) {
        if (group.modifiers.reorder !== null) {
            const items = group.modifiers.reorder

            customization.push(() => modifierApi.reorderProductModifiers(productId, group.id, items))
        }
    }

    const media: Array<() => Promise<void>> = []

    // Removals first so the product never exceeds its photo limit mid-save.
    for (const id of plan.media.remove) {
        media.push(() => mediaApi.deleteProductMedia(productId, id))
    }

    for (const item of plan.media.create) {
        media.push(() =>
            mediaApi
                .createProductMedia(productId, {
                    object_key: item.object_key,
                    alt_text: item.alt_text,
                    is_primary: item.is_primary,
                    display_order: item.display_order,
                })
                .then(() => undefined)
        )
    }

    if (plan.media.primaryId !== null) {
        const id = plan.media.primaryId

        media.push(() => mediaApi.setPrimaryProductMedia(productId, id).then(() => undefined))
    }

    if (plan.media.reorder !== null) {
        const items = plan.media.reorder

        media.push(() => mediaApi.reorderProductMedia(productId, items))
    }

    const outlets: Array<() => Promise<void>> = []

    if (plan.outlets.replace !== null) {
        const ids = plan.outlets.replace

        outlets.push(() => productOutletApi.replaceProductOutlets(productId, ids).then(() => undefined))
    }

    return { product, variants, customization, media, outlets }
}

/**
 * Applying a plan to a product that already exists.
 *
 * A step that throws stops the chain and says which one failed, so the merchant
 * sees exactly what is unfinished rather than a toast that has already gone. A
 * retry then resumes each unfinished step from where it stopped, which is what
 * keeps a half-applied edit from becoming a duplicated one.
 */
export function useUpdateProductBundle(productId: string) {
    const queryClient = useQueryClient()
    const [steps, setSteps] = useState<BundleStep[]>(() => initialSteps(emptyPlan()))

    /**
     * The plan this attempt is running, and how far through each step it got.
     *
     * A retry deliberately replays the same plan rather than rebuilding it from
     * the form: the steps that already settled have changed the product, so a
     * fresh diff would no longer describe it. The cursors are what make replaying
     * it safe — without them a retry would run a step's creates a second time.
     */
    const progressRef = useRef<{ plan: EditPlan; cursors: Record<BundleStepKey, number> } | null>(null)

    const mark = useCallback((key: BundleStepKey, status: BundleStepStatus, error: unknown = null) => {
        setSteps((current) => current.map((step) => (step.key === key ? { ...step, status, error } : step)))
    }, [])

    const mutation = useMutation({
        mutationFn: async ({ retryKeys }: { retryKeys: BundleStepKey[] | null }) => {
            const progress = progressRef.current

            if (progress === null) {
                throw new Error("Belum ada perubahan untuk disimpan.")
            }

            const operations = buildOperations(productId, progress.plan)
            const shouldRun = (key: BundleStepKey) => retryKeys === null || retryKeys.includes(key)

            for (const { key } of EDIT_STEPS) {
                // A step with nothing in it is left at whatever it was already
                // marked — `skipped` — rather than being run and reported as a
                // success it did not earn.
                if (!shouldRun(key) || isStepEmpty(key, progress.plan)) {
                    continue
                }

                mark(key, "running")

                try {
                    for (const [index, run] of operations[key].entries()) {
                        if (index < progress.cursors[key]) {
                            continue
                        }

                        await run()

                        // Only recorded once the call has actually returned, so a
                        // failure leaves the cursor pointing at the work to redo.
                        progress.cursors[key] = index + 1
                    }

                    mark(key, "success")
                } catch (error) {
                    mark(key, "failed", error)
                    throw error
                }
            }
        },
        onSuccess: () => invalidateProducts(queryClient, productId),
    })

    const pendingKeys = steps.filter(isOwed).map((step) => step.key)

    function start(plan: EditPlan) {
        progressRef.current = {
            plan,
            cursors: { product: 0, variants: 0, customization: 0, media: 0, outlets: 0 },
        }
        setSteps(initialSteps(plan))
        mutation.mutate({ retryKeys: null })
    }

    /**
     * Carry on from a failure. Steps that already settled are not run again, and
     * the ones that are resume from their cursors rather than from the top, so a
     * row that was already created is not created twice and one that was already
     * deleted is not deleted against a stale list.
     */
    function retry() {
        const progress = progressRef.current

        if (progress === null || pendingKeys.length === 0) {
            return
        }

        // A step that had nothing to do when the plan was read still has nothing
        // to do, so its skipped mark is reasserted before the chain resumes.
        setSteps((current) =>
            current.map((step) => (isStepEmpty(step.key, progress.plan) ? { ...step, status: "skipped" } : step))
        )

        mutation.mutate({ retryKeys: pendingKeys })
    }

    return {
        start,
        retry,
        steps,
        pendingKeys,
        hasFailure: steps.some((step) => step.status === "failed"),
        isPending: mutation.isPending,
        hasStarted: steps.some((step) => step.status !== "pending"),
    }
}

/**
 * A row's status is not part of the patch that changes its fields — the API moves
 * it through activate/deactivate — so it is applied as its own call, and only
 * when it has actually moved.
 */
async function setVariantStatus(productId: string, id: string, status: CatalogStatus) {
    if (status === "active") {
        await variantApi.activateProductVariant(productId, id)
        return
    }

    await variantApi.deactivateProductVariant(productId, id)
}

async function setModifierStatus(productId: string, groupId: string, id: string, status: CatalogStatus) {
    if (status === "active") {
        await modifierApi.activateProductModifier(productId, groupId, id)
        return
    }

    await modifierApi.deactivateProductModifier(productId, groupId, id)
}

async function setGroupStatus(productId: string, groupId: string, status: CatalogStatus) {
    if (status === "active") {
        await modifierApi.activateProductModifierGroup(productId, groupId)
        return
    }

    await modifierApi.deactivateProductModifierGroup(productId, groupId)
}

function emptyPlan(): EditPlan {
    return {
        product: null,
        variants: { create: [], update: [], remove: [], reorder: null },
        customization: { groups: { create: [], update: [], remove: [], reorder: null } },
        media: { create: [], remove: [], primaryId: null, reorder: null },
        outlets: { replace: null },
    }
}
