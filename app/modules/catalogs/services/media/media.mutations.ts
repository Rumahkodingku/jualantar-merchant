import { useMutation, useQueryClient } from "@tanstack/react-query"

import { invalidateProducts } from "../catalog.invalidation"
import * as mediaApi from "./media.api"
import type { MediaRegisterInput, ReorderItem } from "../../types"

export function useAddMedia(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: MediaRegisterInput) => mediaApi.createProductMedia(productId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useDeleteMedia(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (mediaId: string) => mediaApi.deleteProductMedia(productId, mediaId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useSetPrimaryMedia(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (mediaId: string) => mediaApi.setPrimaryProductMedia(productId, mediaId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useReorderMedia(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (items: ReorderItem[]) => mediaApi.reorderProductMedia(productId, items),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}
