import { useMutation, useQueryClient } from "@tanstack/react-query"

import { invalidateProducts } from "../catalog.invalidation"
import * as modifierApi from "./modifier.api"
import type {
    ModifierCreateInput,
    ModifierGroupCreateInput,
    ModifierGroupUpdateInput,
    ModifierUpdateInput,
} from "../../types"

/**
 * The four writes a customization row can make on its own.
 *
 * A product's groups and options are otherwise written by the edit wizard's save,
 * which works out the whole change at once. These exist for the one case that is
 * not a whole-product edit: a row inside a form dialog, where the merchant has
 * changed one group or one option and nothing else.
 *
 * Everything else — deleting either, reordering them, moving either between
 * active and inactive — belongs to that save, because each of those only means
 * anything relative to the rest of the product.
 */
export function useCreateModifierGroup(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: ModifierGroupCreateInput) => modifierApi.createProductModifierGroup(productId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useUpdateModifierGroup(productId: string, groupId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: ModifierGroupUpdateInput) =>
            modifierApi.updateProductModifierGroup(productId, groupId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useCreateModifier(productId: string, groupId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: ModifierCreateInput) => modifierApi.createProductModifier(productId, groupId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useUpdateModifier(productId: string, groupId: string, modifierId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: ModifierUpdateInput) =>
            modifierApi.updateProductModifier(productId, groupId, modifierId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}
