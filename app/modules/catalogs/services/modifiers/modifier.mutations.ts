import { useMutation, useQueryClient } from "@tanstack/react-query"

import { catalogRepository } from "../catalog.repository"
import { invalidateProducts } from "../catalog.invalidation"
import type {
    CatalogStatus,
    ModifierCreateInput,
    ModifierGroupCreateInput,
    ModifierGroupUpdateInput,
    ModifierUpdateInput,
    ReorderItem,
} from "../../types/catalog.types"

export function useCreateModifierGroup(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: ModifierGroupCreateInput) => catalogRepository.modifierGroups.create(productId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useUpdateModifierGroup(productId: string, groupId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: ModifierGroupUpdateInput) =>
            catalogRepository.modifierGroups.update(productId, groupId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useDeleteModifierGroup(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (groupId: string) => catalogRepository.modifierGroups.delete(productId, groupId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useSetModifierGroupStatus(productId: string, groupId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (status: CatalogStatus) =>
            status === "active"
                ? catalogRepository.modifierGroups.activate(productId, groupId)
                : catalogRepository.modifierGroups.deactivate(productId, groupId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useReorderModifierGroups(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (items: ReorderItem[]) => catalogRepository.modifierGroups.reorder(productId, items),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useReorderModifiers(productId: string, groupId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (items: ReorderItem[]) => catalogRepository.modifiers.reorder(productId, groupId, items),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useCreateModifier(productId: string, groupId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: ModifierCreateInput) => catalogRepository.modifiers.create(productId, groupId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useUpdateModifier(productId: string, groupId: string, modifierId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: ModifierUpdateInput) =>
            catalogRepository.modifiers.update(productId, groupId, modifierId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useDeleteModifier(productId: string, groupId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (modifierId: string) => catalogRepository.modifiers.delete(productId, groupId, modifierId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useSetModifierStatus(productId: string, groupId: string, modifierId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (status: CatalogStatus) =>
            status === "active"
                ? catalogRepository.modifiers.activate(productId, groupId, modifierId)
                : catalogRepository.modifiers.deactivate(productId, groupId, modifierId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}
