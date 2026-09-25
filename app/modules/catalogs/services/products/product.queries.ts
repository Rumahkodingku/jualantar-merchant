import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { catalogKeys } from "../catalog.keys"
import { catalogRepository } from "../catalog.repository"
import type { ProductIndexParams } from "../../types/catalog.types"

type QueryGate = { enabled?: boolean }

export function useProducts(params: ProductIndexParams = {}) {
    return useQuery({
        queryKey: catalogKeys.productList(params),
        queryFn: () => catalogRepository.products.list(params),
        placeholderData: keepPreviousData,
    })
}

export function useProductDetail(productId: string | undefined, gate: QueryGate = {}) {
    return useQuery({
        queryKey: catalogKeys.product(productId ?? ""),
        queryFn: () => catalogRepository.products.get(productId as string),
        enabled: productId !== undefined && productId.length > 0 && (gate.enabled ?? true),
    })
}
