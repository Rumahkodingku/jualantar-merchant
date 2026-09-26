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
