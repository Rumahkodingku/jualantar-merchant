import { useMutation, useQueryClient } from "@tanstack/react-query"

import { catalogRepository } from "../catalog.repository"
import { invalidateProducts } from "../catalog.invalidation"
import type { CatalogStatus, OutletAvailabilityInput } from "../../types/catalog.types"

export function useReplaceProductOutlets(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (outletIds: string[]) => catalogRepository.productOutlets.replace(productId, outletIds),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useRemoveProductOutlet(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (outletId: string) => catalogRepository.productOutlets.remove(productId, outletId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useSetOutletAssignmentStatus(productId: string, outletId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (status: CatalogStatus) =>
            status === "active"
                ? catalogRepository.productOutlets.activate(productId, outletId)
                : catalogRepository.productOutlets.deactivate(productId, outletId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useSetOutletAvailability(productId: string, outletId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: OutletAvailabilityInput) =>
            catalogRepository.productOutlets.setAvailability(productId, outletId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}
