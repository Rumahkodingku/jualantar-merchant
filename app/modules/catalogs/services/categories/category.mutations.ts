import { useMutation, useQueryClient } from "@tanstack/react-query"

import { catalogRepository } from "../catalog.repository"
import { invalidateCategories } from "../catalog.invalidation"
import type { CatalogStatus, CategoryCreateInput, CategoryUpdateInput, ReorderItem } from "../../types/catalog.types"

export function useCreateCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: CategoryCreateInput) => catalogRepository.categories.create(input),
        onSuccess: () => invalidateCategories(queryClient),
    })
}

export function useUpdateCategory(categoryId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: CategoryUpdateInput) => catalogRepository.categories.update(categoryId, input),
        onSuccess: () => invalidateCategories(queryClient, categoryId),
    })
}

export function useDeleteCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (categoryId: string) => catalogRepository.categories.delete(categoryId),
        onSuccess: () => invalidateCategories(queryClient),
    })
}

export function useSetCategoryStatus(categoryId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (status: CatalogStatus) =>
            status === "active"
                ? catalogRepository.categories.activate(categoryId)
                : catalogRepository.categories.deactivate(categoryId),
        onSuccess: () => invalidateCategories(queryClient, categoryId),
    })
}

export function useReorderCategories() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (items: ReorderItem[]) => catalogRepository.categories.reorder(items),
        onSuccess: () => invalidateCategories(queryClient),
    })
}
