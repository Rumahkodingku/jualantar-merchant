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
