import { useMutation, useQueryClient } from "@tanstack/react-query"

import { invalidateProducts } from "../catalog.invalidation"
import * as productApi from "./product.api"
import type { CatalogStatus, ProductUpdateInput, ReorderItem } from "../../types"

export function useUpdateProduct(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: ProductUpdateInput) => productApi.updateProduct(productId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useDeleteProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (productId: string) => productApi.deleteProduct(productId),
        onSuccess: () => invalidateProducts(queryClient),
    })
}

export function useSetProductStatus(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (status: CatalogStatus) =>
            status === "active" ? productApi.activateProduct(productId) : productApi.deactivateProduct(productId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useReorderProducts() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (items: ReorderItem[]) => productApi.reorderProducts(items),
        onSuccess: () => invalidateProducts(queryClient),
    })
}
