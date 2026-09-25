import { useMutation, useQueryClient } from "@tanstack/react-query"

import { catalogRepository } from "../catalog.repository"
import { invalidateProducts } from "../catalog.invalidation"
import type { CatalogStatus, ProductUpdateInput, ReorderItem } from "../../types/catalog.types"

export function useUpdateProduct(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: ProductUpdateInput) => catalogRepository.products.update(productId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useDeleteProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (productId: string) => catalogRepository.products.delete(productId),
        onSuccess: () => invalidateProducts(queryClient),
    })
}

export function useSetProductStatus(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (status: CatalogStatus) =>
            status === "active"
                ? catalogRepository.products.activate(productId)
                : catalogRepository.products.deactivate(productId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useReorderProducts() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (items: ReorderItem[]) => catalogRepository.products.reorder(items),
        onSuccess: () => invalidateProducts(queryClient),
    })
}
