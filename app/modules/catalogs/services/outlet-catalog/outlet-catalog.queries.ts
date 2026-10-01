import { useQuery } from "@tanstack/react-query"

import { catalogKeys } from "../catalog.keys"
import * as outletCatalogApi from "./outlet-catalog.api"
import type { OutletCatalogIndexParams } from "../../types"

export function useOutletProducts(
    outletId: string | undefined,
    params: OutletCatalogIndexParams = {},
    options: { refetchInterval?: number } = {}
) {
    return useQuery({
        queryKey: catalogKeys.outletProductList(outletId ?? "", params),
        queryFn: () => outletCatalogApi.fetchOutletProducts(outletId as string, params),
        enabled: outletId !== undefined && outletId.length > 0,
        // No keepPreviousData: switching outlets must never show the previous
        // outlet's products, even momentarily.
        refetchInterval: options.refetchInterval,
    })
}

export function useOutletProductDetail(outletId: string | undefined, productId: string | undefined) {
    return useQuery({
        queryKey: catalogKeys.outletProduct(outletId ?? "", productId ?? ""),
        queryFn: () => outletCatalogApi.fetchOutletProduct(outletId as string, productId as string),
        enabled: outletId !== undefined && outletId.length > 0 && productId !== undefined && productId.length > 0,
    })
}
