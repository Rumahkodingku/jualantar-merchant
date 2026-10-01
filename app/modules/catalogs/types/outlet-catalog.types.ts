import type { AvailabilityStatus, CatalogStatus, ProductType, SortOrder } from "./common.types"
import type { ProductModifierGroup } from "./modifier.types"
import type { OutletScopedStatus } from "./outlet-override.types"
import type { ProductPrimaryMedia } from "./product.types"

/**
 * The outlet catalog is the operational view of products assigned to a single
 * outlet. Its wire shape is deliberately narrower than the master product
 * (`OutletCatalogItemResource`), so it gets its own contract instead of being
 * forced into `Product` / `ProductDetail`.
 *
 * Every item carries `status` (the master value, which the owner owns and which
 * acts as the ceiling) next to `effective_status` and `is_overridden` (what the
 * item actually is at this outlet). The list only ever carries effective-active
 * items, while the detail also carries the ones hidden at this outlet so a
 * manager can bring them back.
 */

export interface OutletCatalogProduct {
    id: string
    name: string
    description: string | null
    product_type: ProductType
    price: number | null
    status: CatalogStatus
}

export interface OutletCatalogCategory {
    id: string
    name: string
    status: CatalogStatus
}

export interface OutletCatalogVariant extends OutletScopedStatus {
    id: string
    name: string
    sku: string | null
    price: number
    is_default: boolean
}

/** A customization option as the outlet sees it. */
export interface OutletModifier extends OutletScopedStatus {
    id: string
    name: string
    description: string | null
    price: number
    is_default: boolean
    display_order: number
    created_at: string | null
    updated_at: string | null
}

/** A customization group as the outlet sees it. */
export interface OutletModifierGroup extends OutletScopedStatus {
    id: string
    name: string
    description: string | null
    selection_type: ProductModifierGroup["selection_type"]
    min_selection: number
    max_selection: number | null
    is_required: boolean
    display_order: number
    created_at: string | null
    updated_at: string | null
    modifiers: OutletModifier[]
}

/** The assignment of this product to the outlet in scope (never another outlet's). */
export interface OutletCatalogAssignment {
    id: string
    status: CatalogStatus
    availability_status: AvailabilityStatus
    unavailable_reason: string | null
    display_order: number
}

export interface OutletCatalogItem {
    product: OutletCatalogProduct
    category: OutletCatalogCategory | null
    variants: OutletCatalogVariant[]
    primary_media: ProductPrimaryMedia | null
    modifier_groups: OutletModifierGroup[]
    assignment: OutletCatalogAssignment | null
    is_sellable: boolean
}

export type OutletCatalogSortField = "name" | "display_order" | "created_at"

export interface OutletCatalogIndexParams {
    search?: string
    category_id?: string
    status?: CatalogStatus
    availability?: AvailabilityStatus
    sort?: OutletCatalogSortField
    order?: SortOrder
    per_page?: number
    page?: number
}

export interface OutletCatalogReorderItem {
    product_id: string
    display_order: number
}
