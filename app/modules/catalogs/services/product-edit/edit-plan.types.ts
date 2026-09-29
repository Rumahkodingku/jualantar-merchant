import type {
    CatalogStatus,
    GroupDraft,
    ModifierGroupUpdateInput,
    ModifierUpdateInput,
    ProductUpdateInput,
    VariantCreateInput,
    VariantUpdateInput,
} from "../../types"

/**
 * One row's worth of change, in the order the API has to be called in.
 *
 * `update` and `status` are separate because the API is: a variant's fields go
 * through a patch, but its active status only moves through activate/deactivate.
 * A row can need either, both, or neither, so the plan carries them apart and
 * lets the save skip the ones that are already right.
 */
export interface VariantChange {
    id: string
    update: VariantUpdateInput
    status: CatalogStatus | null
}

export interface ModifierChange {
    id: string
    update: ModifierUpdateInput
    status: CatalogStatus | null
}

export interface GroupChange {
    id: string
    update: ModifierGroupUpdateInput
    status: CatalogStatus | null
    /** Options of this group that changed, keyed by the group they belong to. */
    modifiers: {
        create: Array<{ name: string; description: string | null; price: number; is_default: boolean }>
        update: ModifierChange[]
        remove: string[]
        reorder: Array<{ id: string; display_order: number }> | null
    }
}

export interface EditPlan {
    product: ProductUpdateInput | null
    variants: {
        create: VariantCreateInput[]
        update: VariantChange[]
        remove: string[]
        reorder: Array<{ id: string; display_order: number }> | null
    }
    customization: {
        groups: {
            create: Array<{
                group: {
                    name: string
                    description: string | null
                    selection_type: GroupDraft["selection_type"]
                    min_selection: number
                    max_selection: number | null
                    is_required: boolean
                }
                modifiers: Array<{ name: string; description: string | null; price: number; is_default: boolean }>
            }>
            update: GroupChange[]
            remove: string[]
            reorder: Array<{ id: string; display_order: number }> | null
        }
    }
    media: {
        create: Array<{ object_key: string; alt_text: string | null; is_primary: boolean; display_order: number }>
        remove: string[]
        primaryId: string | null
        reorder: Array<{ id: string; display_order: number }> | null
    }
    outlets: { replace: string[] | null }
}

/** Nothing in this plan needs a request — the merchant walked through and left it be. */
export function isPlanEmpty(plan: EditPlan): boolean {
    return (
        plan.product === null &&
        plan.variants.create.length === 0 &&
        plan.variants.update.length === 0 &&
        plan.variants.remove.length === 0 &&
        plan.variants.reorder === null &&
        plan.customization.groups.create.length === 0 &&
        plan.customization.groups.update.length === 0 &&
        plan.customization.groups.remove.length === 0 &&
        plan.customization.groups.reorder === null &&
        plan.customization.groups.update.every((group) => isModifierGroupEmpty(group.modifiers)) &&
        plan.media.create.length === 0 &&
        plan.media.remove.length === 0 &&
        plan.media.primaryId === null &&
        plan.media.reorder === null &&
        plan.outlets.replace === null
    )
}

/** A group's options, considered apart from the group itself. */
export function isModifierGroupEmpty(modifiers: GroupChange["modifiers"]): boolean {
    return (
        modifiers.create.length === 0 &&
        modifiers.update.length === 0 &&
        modifiers.remove.length === 0 &&
        modifiers.reorder === null
    )
}
