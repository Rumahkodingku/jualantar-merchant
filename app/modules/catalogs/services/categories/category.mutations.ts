import { useMutation, useQueryClient } from "@tanstack/react-query"

import { invalidateCategories } from "../catalog.invalidation"
import * as categoryApi from "./category.api"
import type { CatalogStatus, CategoryCreateInput, CategoryUpdateInput, ReorderItem } from "../../types"

export function useCreateCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: CategoryCreateInput) => categoryApi.createCategory(input),
        onSuccess: () => invalidateCategories(queryClient),
    })
}

export function useUpdateCategory(categoryId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: CategoryUpdateInput) => categoryApi.updateCategory(categoryId, input),
        onSuccess: () => invalidateCategories(queryClient, categoryId),
    })
}

export function useDeleteCategory() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (categoryId: string) => categoryApi.deleteCategory(categoryId),
        onSuccess: () => invalidateCategories(queryClient),
    })
}

export function useSetCategoryStatus(categoryId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (status: CatalogStatus) =>
            status === "active" ? categoryApi.activateCategory(categoryId) : categoryApi.deactivateCategory(categoryId),
        onSuccess: () => invalidateCategories(queryClient, categoryId),
    })
}

export function useReorderCategories() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (items: ReorderItem[]) => categoryApi.reorderCategories(items),
        onSuccess: () => invalidateCategories(queryClient),
    })
}
