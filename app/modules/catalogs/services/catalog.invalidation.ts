import type { QueryClient } from "@tanstack/react-query"

import { catalogKeys } from "./catalog.keys"

export function invalidateProducts(queryClient: QueryClient, productId?: string) {
    void queryClient.invalidateQueries({ queryKey: catalogKeys.products() })

    if (productId !== undefined) {
        void queryClient.invalidateQueries({ queryKey: catalogKeys.product(productId) })
    }
}

export function invalidateCategories(queryClient: QueryClient, categoryId?: string) {
    void queryClient.invalidateQueries({ queryKey: catalogKeys.categories() })

    if (categoryId !== undefined) {
        void queryClient.invalidateQueries({ queryKey: catalogKeys.category(categoryId) })
    }
}

export function invalidateProductDraft(queryClient: QueryClient) {
    return queryClient.invalidateQueries({ queryKey: catalogKeys.productDraft() })
}

/**
 * Invalidate the outlet catalog for a single outlet only. Outlet-scoped actions
 * (availability, assignment status, reorder) must not fan out to the master
 * product cache or to another outlet's cache.
 */
export function invalidateOutletCatalog(queryClient: QueryClient, outletId: string, productId?: string) {
    void queryClient.invalidateQueries({ queryKey: catalogKeys.outletCatalogFor(outletId) })

    if (productId !== undefined) {
        void queryClient.invalidateQueries({ queryKey: catalogKeys.outletProduct(outletId, productId) })
    }
}
