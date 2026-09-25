export type ProductType = "simple" | "variable"

export type CatalogStatus = "active" | "inactive"

export type SelectionType = "single" | "multiple"

export type AvailabilityStatus = "available" | "unavailable"

export interface CatalogCategory {
    id: string
    name: string
    description: string | null
    status: CatalogStatus
    display_order: number
    created_at: string | null
    updated_at: string | null
}

export interface Product {
    id: string
    category_id: string
    name: string
    description: string | null
    product_type: ProductType
    price: number | null
    status: CatalogStatus
    display_order: number
    created_at: string | null
    updated_at: string | null
}

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
}

export interface ProductMedia {
    id: string
    url: string | null
    alt_text: string | null
    mime_type: string
    file_size: number | null
    is_primary: boolean
    display_order: number
    created_at: string | null
    updated_at: string | null
}

export interface ProductModifier {
    id: string
    name: string
    description: string | null
    price: number
    is_default: boolean
    status: CatalogStatus
    display_order: number
    created_at: string | null
    updated_at: string | null
}

export interface ProductModifierGroup {
    id: string
    name: string
    description: string | null
    selection_type: SelectionType
    min_selection: number
    max_selection: number | null
    is_required: boolean
    status: CatalogStatus
    display_order: number
    created_at: string | null
    updated_at: string | null
    modifiers: ProductModifier[]
}

export interface CatalogOutlet {
    id: string
    name: string
    status: CatalogStatus
}

export interface OutletProductAssignment {
    id: string
    product_id: string
    outlet_id: string
    outlet?: {
        id: string
        name: string
        status: string
    }
    status: CatalogStatus
    availability_status: AvailabilityStatus
    unavailable_reason: string | null
    display_order: number
    created_at: string | null
    updated_at: string | null
}

export interface ProductDetail extends Product {
    category?: CatalogCategory
    variants?: ProductVariant[]
    media?: ProductMedia[]
    modifier_groups?: ProductModifierGroup[]
}

export interface PaginationMeta {
    current_page: number
    per_page: number
    total: number
    last_page: number
}

export interface PaginatedResponse<T> {
    data: T[]
    meta: PaginationMeta
}

export type ProductSortField = "name" | "display_order" | "created_at"

export type CategorySortField = "name" | "display_order" | "created_at"

export type SortOrder = "asc" | "desc"

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

export interface CategoryIndexParams {
    search?: string
    status?: CatalogStatus
    sort?: CategorySortField
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

export interface CategoryCreateInput {
    name: string
    description?: string | null
}

export interface CategoryUpdateInput {
    name?: string
    description?: string | null
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

export interface MediaCreateInput {
    url: string
    alt_text?: string | null
    mime_type?: string
    file_size?: number | null
    is_primary?: boolean
}

export interface ModifierGroupCreateInput {
    name: string
    description?: string | null
    selection_type: SelectionType
    min_selection: number
    max_selection?: number | null
    is_required: boolean
}

export interface ModifierGroupUpdateInput {
    name?: string
    description?: string | null
    selection_type?: SelectionType
    min_selection?: number
    max_selection?: number | null
    is_required?: boolean
}

export interface ModifierCreateInput {
    name: string
    description?: string | null
    price: number
    is_default?: boolean
}

export interface ModifierUpdateInput {
    name?: string
    description?: string | null
    price?: number
    is_default?: boolean
}

export interface ReorderItem {
    id: string
    display_order: number
}
