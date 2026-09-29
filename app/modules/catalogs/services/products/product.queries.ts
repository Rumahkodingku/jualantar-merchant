import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { catalogKeys } from "../catalog.keys"
import * as productApi from "./product.api"
import type { ProductIndexParams } from "../../types"

type QueryGate = { enabled?: boolean }

/**
 * Below the signed media URL lifetime (STORAGE_TEMPORARY_URL_TTL, 300s by
 * default) so a list left open still gets fresh cover URLs. Callers without
 * media on screen opt out instead of polling a payload they do not render.
 */
export const PRODUCT_MEDIA_REFRESH_INTERVAL = 240_000

export function useProducts(params: ProductIndexParams = {}, options: { refetchInterval?: number } = {}) {
    return useQuery({
        queryKey: catalogKeys.productList(params),
        queryFn: () => productApi.fetchProducts(params),
        placeholderData: keepPreviousData,
        refetchInterval: options.refetchInterval,
    })
}

export function useProductDetail(productId: string | undefined, gate: QueryGate = {}) {
    return useQuery({
        queryKey: catalogKeys.product(productId ?? ""),
        queryFn: () => productApi.fetchProduct(productId as string),
        enabled: productId !== undefined && productId.length > 0 && (gate.enabled ?? true),
    })
}
