import type { CatalogStatus, SortOrder } from "./common.types"
import type { OutletItemOverride } from "./outlet-override.types"

export interface ProductVariant {
    id: string
    name: string
    sku: string | null
    price: number
    status: CatalogStatus
    is_default: boolean
    display_order: number
    created_at: string | null
    updated_at: string | null
    /** Present only on the master product detail, never on the list endpoints. */
    outlet_overrides?: OutletItemOverride[]
}

export interface VariantIndexParams {
    search?: string
    status?: CatalogStatus
    sort?: "name" | "price" | "display_order" | "created_at"
    order?: SortOrder
    per_page?: number
    page?: number
}

export interface VariantCreateInput {
    name: string
    sku?: string | null
    price: number
    is_default?: boolean
}

export interface VariantUpdateInput {
    name?: string
    sku?: string | null
    price?: number
    is_default?: boolean
}
