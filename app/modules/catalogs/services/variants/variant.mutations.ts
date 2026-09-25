import { useMutation, useQueryClient } from "@tanstack/react-query"

import { catalogRepository } from "../catalog.repository"
import { invalidateProducts } from "../catalog.invalidation"
import type { CatalogStatus, ReorderItem, VariantCreateInput, VariantUpdateInput } from "../../types/catalog.types"

export function useCreateVariant(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: VariantCreateInput) => catalogRepository.variants.create(productId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useUpdateVariant(productId: string, variantId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: VariantUpdateInput) => catalogRepository.variants.update(productId, variantId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useDeleteVariant(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (variantId: string) => catalogRepository.variants.delete(productId, variantId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useSetVariantStatus(productId: string, variantId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (status: CatalogStatus) =>
            status === "active"
                ? catalogRepository.variants.activate(productId, variantId)
                : catalogRepository.variants.deactivate(productId, variantId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useReorderVariants(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (items: ReorderItem[]) => catalogRepository.variants.reorder(productId, items),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}
