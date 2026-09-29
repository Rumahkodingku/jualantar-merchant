import type { GroupDraft, MediaDraft, VariantDraft } from "./product-draft.types"
import type { ProductMedia } from "./media.types"
import type { ProductModifierGroup } from "./modifier.types"
import type { ProductVariant } from "./variant.types"
import type { ProductInfoFormValues } from "../schemas"

/**
 * What the edit wizard holds while the merchant walks through it.
 *
 * The shape mirrors the create wizard's form so the same step components can
 * render both, and the rows are the same draft rows with their server id filled
 * in — that id is what lets the save tell a patch from a create.
 */
export interface EditForm {
    info: ProductInfoFormValues
    priceRaw: string
    variants: VariantDraft[]
    groups: GroupDraft[]
    media: MediaDraft[]
    outletIds: string[]
}

/**
 * What the product looked like when the wizard opened.
 *
 * The save is a diff between this and the form, so the snapshot is taken once
 * and never moves. Without it there is no way to tell a row the merchant
 * deleted from a row that was never there. The child collections stay in the
 * shape the API returns them, because that is the only place their ids and
 * their statuses live.
 */
export interface EditSnapshot {
    name: string
    category_id: string
    description: string | null
    price: number | null
    outletIds: string[]
    variants: ProductVariant[]
    groups: ProductModifierGroup[]
    media: ProductMedia[]
}
