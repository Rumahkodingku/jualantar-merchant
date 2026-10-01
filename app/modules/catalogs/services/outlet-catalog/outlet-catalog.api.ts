import { api } from "~/lib/api"
import { toOutletCatalogItem, type OutletCatalogItemWire } from "./outlet-catalog.mappers"
import type {
    OutletCatalogIndexParams,
    OutletCatalogItem,
    OutletCatalogReorderItem,
    OutletItemOverride,
    PaginatedResponse,
} from "../../types"

const BASE = "/merchant/catalog/outlets"

/** The three kinds of item an outlet manager may restrict at their outlet. */
export type OutletItemTarget =
    | { kind: "variant"; itemId: string }
    | { kind: "modifier_group"; itemId: string }
    | { kind: "modifier"; groupId: string; itemId: string }

/**
 * The URL of one per-outlet status override action.
 *
 * Kept in one place because the six endpoints only differ by the item kind, and
 * getting the nesting wrong would silently write to the wrong resource.
 */
function overrideUrl(outletId: string, productId: string, target: OutletItemTarget, action: string): string {
    const root = `${BASE}/${outletId}/products/${productId}`
    const path =
        target.kind === "modifier"
            ? `modifier-groups/${target.groupId}/modifiers/${target.itemId}`
            : target.kind === "modifier_group"
              ? `modifier-groups/${target.itemId}`
              : `variants/${target.itemId}`

    return `${root}/${path}/${action}`
}

/**
 * Hide one item at this outlet without touching the master catalog. The API
 * refuses with 409 when it would leave the product unsellable here, and when
 * the master already has the item inactive.
 */
export async function deactivateOutletItem(
    outletId: string,
    productId: string,
    target: OutletItemTarget
): Promise<OutletItemOverride> {
    const { data } = await api.post<{ data: OutletItemOverride }>(
        overrideUrl(outletId, productId, target, "deactivate")
    )

    return data.data
}

/**
 * Drop the override so the item follows the master catalog again. This is not a
 * promotion: an item the owner left inactive stays inactive.
 */
export async function resetOutletItem(outletId: string, productId: string, target: OutletItemTarget): Promise<void> {
    await api.post(overrideUrl(outletId, productId, target, "reset"))
}

export async function fetchOutletProducts(
    outletId: string,
    params: OutletCatalogIndexParams = {}
): Promise<PaginatedResponse<OutletCatalogItem>> {
    const { data } = await api.get<PaginatedResponse<OutletCatalogItemWire>>(`${BASE}/${outletId}/products`, {
        params,
    })

    return {
        data: data.data.map(toOutletCatalogItem),
        meta: data.meta,
    }
}

export async function fetchOutletProduct(outletId: string, productId: string): Promise<OutletCatalogItem> {
    const { data } = await api.get<{ data: OutletCatalogItemWire }>(`${BASE}/${outletId}/products/${productId}`)
    return toOutletCatalogItem(data.data)
}

export async function reorderOutletProducts(outletId: string, items: OutletCatalogReorderItem[]): Promise<void> {
    await api.put(`${BASE}/${outletId}/products/order`, { items })
}
