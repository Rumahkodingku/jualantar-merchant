import type { OperationalOutlet } from "~/modules/merchant-operations"

import type { AvailabilityStatus, CatalogStatus, SortOrder } from "./common.types"

/** The outlet shape the catalog's own pickers need — nothing more. */
export interface CatalogOutlet {
    id: string
    name: string
    status: CatalogStatus
}

/**
 * The join row a product carries per outlet. `outlet` is the summary the
 * catalog endpoint returns inline; the richer record comes from the
 * merchant-operations outlet directory and is joined on `outlet_id`.
 */
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

/**
 * A catalog assignment paired with the full outlet record coming from the
 * merchant-operations outlet directory. `outlet` is null when the assignment
 * refers to an outlet that the directory query could not resolve.
 */
export interface ProductOutletRow {
    assignment: OutletProductAssignment
    outlet: OperationalOutlet | null
}

export interface OutletIndexParams {
    status?: CatalogStatus
    availability?: AvailabilityStatus
    sort?: "display_order" | "created_at"
    order?: SortOrder
    per_page?: number
    page?: number
}

export interface OutletAvailabilityInput {
    status: AvailabilityStatus
    reason?: string | null
}
