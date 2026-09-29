import { useMutation, useQueryClient } from "@tanstack/react-query"

import { invalidateProducts } from "../catalog.invalidation"
import * as variantApi from "./variant.api"
import type { CatalogStatus, ReorderItem, VariantCreateInput, VariantUpdateInput } from "../../types"

export function useCreateVariant(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: VariantCreateInput) => variantApi.createProductVariant(productId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useUpdateVariant(productId: string, variantId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: VariantUpdateInput) => variantApi.updateProductVariant(productId, variantId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useDeleteVariant(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (variantId: string) => variantApi.deleteProductVariant(productId, variantId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useSetVariantStatus(productId: string, variantId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (status: CatalogStatus) =>
            status === "active"
                ? variantApi.activateProductVariant(productId, variantId)
                : variantApi.deactivateProductVariant(productId, variantId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useReorderVariants(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (items: ReorderItem[]) => variantApi.reorderProductVariants(productId, items),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}
