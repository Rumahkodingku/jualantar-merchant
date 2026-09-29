/** Whether a merchant can see and sell the record. */
export type CatalogStatus = "active" | "inactive"

/** Whether a price is a single amount or the floor of a variant range. */
export type ProductType = "simple" | "variable"

/** How many options a modifier group lets a customer pick. */
export type SelectionType = "single" | "multiple"

/** Whether a product can currently be ordered at a given outlet. */
export type AvailabilityStatus = "available" | "unavailable"

export type SortOrder = "asc" | "desc"

export type ProductSortField = "name" | "display_order" | "created_at"

export type CategorySortField = "name" | "display_order" | "created_at"

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

/**
 * One row of a reorder request. Every reorderable list — products, categories,
 * variants, media, modifier groups, modifiers — takes the same shape and maps
 * it onto its own primary key on the wire.
 */
export interface ReorderItem {
    id: string
    display_order: number
}
