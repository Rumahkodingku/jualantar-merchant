import { queryOptions, useQuery } from "@tanstack/react-query"

import * as productDraftApi from "./product-draft.api"

import { catalogKeys } from "../catalog.keys"

/**
 * The wizard's resumable state. There is at most one draft per merchant and it
 * is the single source of truth, so the form is only rendered once this
 * settles — a briefly empty form would autosave over a draft that does exist.
 */
export const productDraftQueryOptions = queryOptions({
    queryKey: catalogKeys.productDraft(),
    queryFn: productDraftApi.fetchProductDraft,
    staleTime: Infinity,
    retry: false,
})

export function useProductDraft() {
    return useQuery(productDraftQueryOptions)
}
