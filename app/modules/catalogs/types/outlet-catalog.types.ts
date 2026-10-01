import type { AvailabilityStatus, CatalogStatus, ProductType, SortOrder } from "./common.types"
import type { ProductModifierGroup } from "./modifier.types"
import type { ProductPrimaryMedia } from "./product.types"

/**
 * The outlet catalog is the operational view of products assigned to a single
 * outlet. Its wire shape is deliberately narrower than the master product
 * (`OutletCatalogItemResource`), so it gets its own contract instead of being
 * forced into `Product` / `ProductDetail`.
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

export interface OutletCatalogVariant {
    id: string
    name: string
    sku: string | null
    price: number
    status: CatalogStatus
    is_default: boolean
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
    modifier_groups: ProductModifierGroup[]
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
