import { useMutation, useQueryClient } from "@tanstack/react-query"

import { invalidateProducts } from "../catalog.invalidation"
import * as variantApi from "./variant.api"
import type { VariantCreateInput, VariantUpdateInput } from "../../types"

/**
 * The two writes a variant row can make on its own.
 *
 * A product's variants are otherwise written by the edit wizard's save, which
 * works out the whole change at once. These two exist for the one case that is
 * not a whole-product edit: a row inside the form dialog, where the merchant has
 * changed one variant and nothing else.
 *
 * Everything else a variant can need — deleting one, reordering them, moving one
 * between active and inactive — belongs to that save, because each of those only
 * means anything relative to the rest of the list.
 */
export function useCreateVariant(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: VariantCreateInput) => variantApi.createProductVariant(productId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useUpdateVariant(productId: string, variantId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: VariantUpdateInput) => variantApi.updateProductVariant(productId, variantId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}
