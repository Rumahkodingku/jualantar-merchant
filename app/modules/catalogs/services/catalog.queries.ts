import { useMemo } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { useOperationalOutlets, type OperationalOutlet } from "~/modules/merchant-operations"

import { catalogKeys } from "./catalog.keys"
import { catalogRepository } from "./catalog.repository"
import type { CatalogOutlet, CategoryIndexParams, ProductIndexParams } from "../types/catalog.types"

const OUTLETS_PAGE_SIZE = 100

type QueryGate = { enabled?: boolean }

function toCatalogOutlet(outlet: OperationalOutlet): CatalogOutlet {
    return { id: outlet.id, name: outlet.name, status: outlet.status }
}

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
    const query = useOperationalOutlets({ per_page: OUTLETS_PAGE_SIZE })
    const data = useMemo(() => query.data?.data.map(toCatalogOutlet), [query.data])

    return {
        data,
        isPending: query.isPending,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}
