import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { catalogRepository } from "./catalog-mock.repository"
import { catalogKeys } from "./catalog.keys"
import type { CategoryIndexParams, ProductIndexParams } from "../types/catalog.types"

type QueryGate = { enabled?: boolean }

export function useProducts(params: ProductIndexParams = {}) {
    return useQuery({
        queryKey: catalogKeys.productList(params),
        queryFn: () => catalogRepository.products.list(params),
        placeholderData: keepPreviousData,
    })
}

export function useProductViewSummaries() {
    return useQuery({
        queryKey: [...catalogKeys.products(), "view-summaries"] as const,
        queryFn: () => catalogRepository.products.viewSummaries(),
    })
}

export function useProductDetail(productId: string | undefined, gate: QueryGate = {}) {
    return useQuery({
        queryKey: catalogKeys.product(productId ?? ""),
        queryFn: () => catalogRepository.products.get(productId as string),
        enabled: productId !== undefined && productId.length > 0 && (gate.enabled ?? true),
    })
}

export function useProductAssignments(productId: string | undefined) {
    return useQuery({
        queryKey: catalogKeys.productAssignments(productId ?? ""),
        queryFn: () => catalogRepository.productOutlets.list(productId as string),
        enabled: productId !== undefined && productId.length > 0,
    })
}

export function useCategories(params: CategoryIndexParams = {}) {
    return useQuery({
        queryKey: catalogKeys.categoryList(params),
        queryFn: () => catalogRepository.categories.list(params),
        placeholderData: keepPreviousData,
    })
}

export function useOutlets() {
    return useQuery({
        queryKey: catalogKeys.outlets(),
        queryFn: () => catalogRepository.outlets.list(),
    })
}
