import { useMutation, useQueryClient } from "@tanstack/react-query"

import { invalidateOutletCatalog } from "../catalog.invalidation"
import * as outletCatalogApi from "./outlet-catalog.api"
import type { OutletCatalogReorderItem } from "../../types"

/**
 * Reorder the products of a single outlet's catalog. Invalidates only that
 * outlet's list — never the master product order or another outlet.
 */
export function useReorderOutletProducts(outletId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (items: OutletCatalogReorderItem[]) => outletCatalogApi.reorderOutletProducts(outletId, items),
        onSuccess: () => invalidateOutletCatalog(queryClient, outletId),
    })
}

/** One per-outlet status change: which item, and whether it is hidden here. */
export interface OutletItemStatusInput {
    target: outletCatalogApi.OutletItemTarget
    active: boolean
}

/**
 * Hide or restore one item at one outlet.
 *
 * A single hook for all three item kinds: the API decides which one it is from
 * the target, and the resulting state is identical either way — the outlet's
 * effective catalog, and nothing else. Invalidating the outlet scope only is
 * deliberate: the master product status is the ceiling here and never changes,
 * so no master cache needs to be touched.
 */
export function useSetOutletItemStatus(outletId: string, productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        // `deactivate` answers with the created override row while `reset` answers
        // with 204; neither body is needed here, so the result is normalised to
        // void and the caller relies on invalidation + refetch for the new state.
        mutationFn: async ({ target, active }: OutletItemStatusInput): Promise<void> => {
            if (active) {
                await outletCatalogApi.resetOutletItem(outletId, productId, target)
            } else {
                await outletCatalogApi.deactivateOutletItem(outletId, productId, target)
            }
        },
        onSuccess: () => invalidateOutletCatalog(queryClient, outletId, productId),
    })
}
