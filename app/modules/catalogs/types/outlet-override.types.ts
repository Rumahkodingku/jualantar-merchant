import type { CatalogStatus } from "./common.types"

/**
 * The per-outlet status overrides an owner sees on the master product detail.
 *
 * The API only sends these on the master product detail (`ProductDetailResource`)
 * and only for outlets that actually deviated from the master status, so the
 * field is optional: the narrower endpoints omit the key entirely rather than
 * sending an empty array.
 */
export interface OutletItemOverride {
    subject_type: "variant" | "modifier_group" | "modifier"
    item_id: string
    outlet_id: string
    outlet_name: string | null
    status: CatalogStatus
    deactivated_at: string | null
    deactivated_by: {
        id: string
        email: string | null
    } | null
}

/**
 * The two statuses a catalog item has at one outlet, and whether they differ.
 *
 * `status` is what the owner set in the master catalog and stays the ceiling: an
 * outlet manager can only restrict an item, never promote one. `effective_status`
 * is what the item actually is at that outlet, and `is_overridden` marks the
 * items where the outlet deviates.
 */
export interface OutletScopedStatus {
    status: CatalogStatus
    effective_status: CatalogStatus
    is_overridden: boolean
}
