import { useMutation, useQueryClient } from "@tanstack/react-query"

import { invalidateOutletCatalog, invalidateProducts } from "../catalog.invalidation"
import * as productOutletApi from "./product-outlet.api"
import type { CatalogStatus, OutletAvailabilityInput } from "../../types"

/**
 * The two things that can be said about one outlet's assignment, as opposed to
 * which outlets a product belongs in.
 *
 * Replacing the whole list is the edit wizard's save, because it has to be told
 * what the list is now. These two act on a single assignment and nothing else, so
 * they are written the moment the merchant changes one.
 *
 * `invalidateProducts` also covers the product's assignments: the assignments key
 * is nested under the product's, so the summary count and the outlet tab both
 * come back fresh. `invalidateOutletCatalog` keeps the outlet-scoped view of the
 * same assignment in sync, since the same endpoints serve owner and employee.
 */
export function useSetOutletAssignmentStatus(productId: string, outletId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (status: CatalogStatus) =>
            status === "active"
                ? productOutletApi.activateProductOutlet(productId, outletId)
                : productOutletApi.deactivateProductOutlet(productId, outletId),
        onSuccess: () => {
            invalidateProducts(queryClient, productId)
            invalidateOutletCatalog(queryClient, outletId, productId)
        },
    })
}

export function useSetOutletAvailability(productId: string, outletId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: OutletAvailabilityInput) =>
            productOutletApi.updateProductOutletAvailability(productId, outletId, input),
        onSuccess: () => {
            invalidateProducts(queryClient, productId)
            invalidateOutletCatalog(queryClient, outletId, productId)
        },
    })
}
