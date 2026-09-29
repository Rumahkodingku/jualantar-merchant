import { useMutation, useQueryClient } from "@tanstack/react-query"

import { invalidateProducts } from "../catalog.invalidation"
import * as productOutletApi from "./product-outlet.api"
import type { CatalogStatus, OutletAvailabilityInput } from "../../types"

export function useReplaceProductOutlets(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (outletIds: string[]) => productOutletApi.replaceProductOutlets(productId, outletIds),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useRemoveProductOutlet(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (outletId: string) => productOutletApi.removeProductOutlet(productId, outletId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useSetOutletAssignmentStatus(productId: string, outletId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (status: CatalogStatus) =>
            status === "active"
                ? productOutletApi.activateProductOutlet(productId, outletId)
                : productOutletApi.deactivateProductOutlet(productId, outletId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useSetOutletAvailability(productId: string, outletId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: OutletAvailabilityInput) =>
            productOutletApi.updateProductOutletAvailability(productId, outletId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}
