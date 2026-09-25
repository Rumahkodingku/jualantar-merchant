import { useMutation, useQueryClient } from "@tanstack/react-query"

import { catalogRepository } from "../catalog.repository"
import { invalidateProducts } from "../catalog.invalidation"
import type { MediaRegisterInput, ReorderItem } from "../../types/catalog.types"

export function useAddMedia(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: MediaRegisterInput) => catalogRepository.media.create(productId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useDeleteMedia(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (mediaId: string) => catalogRepository.media.delete(productId, mediaId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useSetPrimaryMedia(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (mediaId: string) => catalogRepository.media.setPrimary(productId, mediaId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useReorderMedia(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (items: ReorderItem[]) => catalogRepository.media.reorder(productId, items),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}
