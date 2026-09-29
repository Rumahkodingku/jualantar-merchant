import { useMutation, useQueryClient } from "@tanstack/react-query"

import { invalidateProducts } from "../catalog.invalidation"
import * as modifierApi from "./modifier.api"
import type {
    CatalogStatus,
    ModifierCreateInput,
    ModifierGroupCreateInput,
    ModifierGroupUpdateInput,
    ModifierUpdateInput,
    ReorderItem,
} from "../../types"

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

export function useDeleteModifierGroup(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (groupId: string) => modifierApi.deleteProductModifierGroup(productId, groupId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useSetModifierGroupStatus(productId: string, groupId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (status: CatalogStatus) =>
            status === "active"
                ? modifierApi.activateProductModifierGroup(productId, groupId)
                : modifierApi.deactivateProductModifierGroup(productId, groupId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useReorderModifierGroups(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (items: ReorderItem[]) => modifierApi.reorderProductModifierGroups(productId, items),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useReorderModifiers(productId: string, groupId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (items: ReorderItem[]) => modifierApi.reorderProductModifiers(productId, groupId, items),
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

export function useDeleteModifier(productId: string, groupId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (modifierId: string) => modifierApi.deleteProductModifier(productId, groupId, modifierId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useSetModifierStatus(productId: string, groupId: string, modifierId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (status: CatalogStatus) =>
            status === "active"
                ? modifierApi.activateProductModifier(productId, groupId, modifierId)
                : modifierApi.deactivateProductModifier(productId, groupId, modifierId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}
