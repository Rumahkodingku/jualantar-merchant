import type { CatalogStatus, CategorySortField, SortOrder } from "./common.types"

export interface CatalogCategory {
    id: string
    name: string
    description: string | null
    status: CatalogStatus
    display_order: number
    created_at: string | null
    updated_at: string | null
}

export interface CategoryIndexParams {
    search?: string
    status?: CatalogStatus
    sort?: CategorySortField
    order?: SortOrder
    per_page?: number
    page?: number
}

export interface CategoryCreateInput {
    name: string
    description?: string | null
}

export interface CategoryUpdateInput {
    name?: string
    description?: string | null
}
