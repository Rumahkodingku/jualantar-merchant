import type { CatalogCategory } from "./category.types"
import type { ProductMedia } from "./media.types"
import type { ProductModifierGroup } from "./modifier.types"
import type { ProductVariant } from "./variant.types"
import type { CatalogStatus, ProductSortField, ProductType, SortOrder } from "./common.types"

export interface ProductCategorySummary {
    id: string
    name: string
    status: CatalogStatus
}

export interface ProductPrimaryMedia {
    url: string | null
    alt_text: string | null
}

export interface Product {
    id: string
    category_id: string
    category?: ProductCategorySummary | null
    name: string
    description: string | null
    product_type: ProductType
    price: number | null
    status: CatalogStatus
    display_order: number
    primary_media?: ProductPrimaryMedia | null
    variants_count?: number
    min_price?: number | null
    media_count?: number
    modifier_groups_count?: number
    created_at: string | null
    updated_at: string | null
}

export type ProductDetailPriceType = "fixed" | "from"

export interface ProductDetailPriceSummary {
    type: ProductDetailPriceType
    value: number | null
}

export interface ProductDetailSummary {
    price: ProductDetailPriceSummary
    variants_count: number
    customization_groups_count: number
    media_count: number
    outlets_count: number
}

export interface ProductDetail extends Product {
    category?: CatalogCategory
    summary: ProductDetailSummary
    variants?: ProductVariant[]
    media?: ProductMedia[]
    modifier_groups?: ProductModifierGroup[]
}

export interface ProductIndexParams {
    search?: string
    category_id?: string
    status?: CatalogStatus
    product_type?: ProductType
    sort?: ProductSortField
    order?: SortOrder
    per_page?: number
    page?: number
}

export interface ProductCreateInput {
    category_id: string
    name: string
    description?: string | null
    product_type: ProductType
    price?: number | null
}

export interface ProductUpdateInput {
    category_id?: string
    name?: string
    description?: string | null
    product_type?: ProductType
    price?: number | null
}
