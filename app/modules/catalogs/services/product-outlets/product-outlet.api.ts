import { api } from "~/lib/api"

import { MAX_PER_PAGE, fetchAllPages } from "../pagination"
import type {
    OutletAvailabilityInput,
    OutletIndexParams,
    OutletProductAssignment,
    PaginatedResponse,
} from "../../types"

const BASE = "/merchant/catalog/products"

function productOutletsBase(productId: string) {
    return `${BASE}/${productId}/outlets`
}

export async function fetchProductOutlets(
    productId: string,
    params: OutletIndexParams = {}
): Promise<OutletProductAssignment[]> {
    return fetchAllPages(
        async (page) => {
            const { data } = await api.get<PaginatedResponse<OutletProductAssignment>>(productOutletsBase(productId), {
                params: { ...params, per_page: MAX_PER_PAGE, page },
            })

            return data
        },
        (assignment) => assignment
    )
}

export async function replaceProductOutlets(
    productId: string,
    outletIds: string[]
): Promise<OutletProductAssignment[]> {
    const { data } = await api.put<{ data: OutletProductAssignment[] }>(productOutletsBase(productId), {
        outlet_ids: outletIds,
    })

    return data.data
}

export async function removeProductOutlet(productId: string, outletId: string): Promise<void> {
    await api.delete(`${productOutletsBase(productId)}/${outletId}`)
}

export async function activateProductOutlet(productId: string, outletId: string): Promise<OutletProductAssignment> {
    const { data } = await api.post<{ data: OutletProductAssignment }>(
        `${productOutletsBase(productId)}/${outletId}/activate`
    )

    return data.data
}

export async function deactivateProductOutlet(productId: string, outletId: string): Promise<OutletProductAssignment> {
    const { data } = await api.post<{ data: OutletProductAssignment }>(
        `${productOutletsBase(productId)}/${outletId}/deactivate`
    )

    return data.data
}

export async function updateProductOutletAvailability(
    productId: string,
    outletId: string,
    input: OutletAvailabilityInput
): Promise<OutletProductAssignment> {
    const { data } = await api.post<{ data: OutletProductAssignment }>(
        `${productOutletsBase(productId)}/${outletId}/availability`,
        input
    )

    return data.data
}
