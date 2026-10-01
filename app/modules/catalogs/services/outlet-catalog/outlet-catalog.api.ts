import { api } from "~/lib/api"

import { toOutletCatalogItem, type OutletCatalogItemWire } from "./outlet-catalog.mappers"
import type {
    OutletCatalogIndexParams,
    OutletCatalogItem,
    OutletCatalogReorderItem,
    PaginatedResponse,
} from "../../types"

const BASE = "/merchant/catalog/outlets"

export async function fetchOutletProducts(
    outletId: string,
    params: OutletCatalogIndexParams = {}
): Promise<PaginatedResponse<OutletCatalogItem>> {
    const { data } = await api.get<PaginatedResponse<OutletCatalogItemWire>>(`${BASE}/${outletId}/products`, {
        params,
    })

    return { data: data.data.map(toOutletCatalogItem), meta: data.meta }
}

export async function fetchOutletProduct(outletId: string, productId: string): Promise<OutletCatalogItem> {
    const { data } = await api.get<{ data: OutletCatalogItemWire }>(`${BASE}/${outletId}/products/${productId}`)

    return toOutletCatalogItem(data.data)
}

export async function reorderOutletProducts(outletId: string, items: OutletCatalogReorderItem[]): Promise<void> {
    await api.put(`${BASE}/${outletId}/products/order`, { items })
}
