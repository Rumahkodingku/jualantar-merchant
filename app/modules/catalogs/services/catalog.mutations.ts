import { useMutation, useQueryClient } from "@tanstack/react-query"

import { catalogRepository } from "./catalog-mock.repository"
import { catalogKeys } from "./catalog.keys"
import type {
    AvailabilityStatus,
    CatalogStatus,
    CategoryCreateInput,
    CategoryUpdateInput,
    MediaCreateInput,
    ModifierCreateInput,
    ModifierGroupCreateInput,
    ModifierGroupUpdateInput,
    ModifierUpdateInput,
    ProductCreateInput,
    ProductUpdateInput,
    ReorderItem,
    VariantCreateInput,
    VariantUpdateInput,
} from "../types/catalog.types"

function invalidateProducts(queryClient: ReturnType<typeof useQueryClient>, productId?: string) {
    void queryClient.invalidateQueries({ queryKey: catalogKeys.products() })

    if (productId !== undefined) {
        void queryClient.invalidateQueries({ queryKey: catalogKeys.product(productId) })
    }
}

function invalidateCategories(queryClient: ReturnType<typeof useQueryClient>, categoryId?: string) {
    void queryClient.invalidateQueries({ queryKey: catalogKeys.categories() })

    if (categoryId !== undefined) {
        void queryClient.invalidateQueries({ queryKey: catalogKeys.category(categoryId) })
    }
}

export interface ProductBundleInput {
    product: ProductCreateInput
    variants: VariantCreateInput[]
    modifierGroups: Array<{
        group: ModifierGroupCreateInput
        modifiers: ModifierCreateInput[]
    }>
    media: MediaCreateInput[]
    outletIds: string[]
}

export function useCreateProductBundle() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (input: ProductBundleInput) => {
            const product = await catalogRepository.products.create(input.product)

            for (const variant of input.variants) {
                await catalogRepository.variants.create(product.id, variant)
            }

            for (const entry of input.modifierGroups) {
                const group = await catalogRepository.modifierGroups.create(product.id, entry.group)

                for (const modifier of entry.modifiers) {
                    await catalogRepository.modifiers.create(product.id, group.id, modifier)
                }
            }

            for (const item of input.media) {
                await catalogRepository.media.create(product.id, item)
            }

            if (input.outletIds.length > 0) {
                await catalogRepository.productOutlets.assign(product.id, input.outletIds)
            }

            return product
        },
        onSuccess: (product) => {
            invalidateProducts(queryClient, product.id)
            void queryClient.invalidateQueries({ queryKey: catalogKeys.outlets() })
        },
    })
}

export function useUpdateProduct(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: ProductUpdateInput) => catalogRepository.products.update(productId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useDeleteProduct() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (productId: string) => catalogRepository.products.delete(productId),
        onSuccess: () => invalidateProducts(queryClient),
    })
}

export function useSetProductStatus(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (status: CatalogStatus) =>
            status === "active"
                ? catalogRepository.products.activate(productId)
                : catalogRepository.products.deactivate(productId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useReorderProducts() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (items: ReorderItem[]) => catalogRepository.products.reorder(items),
        onSuccess: () => invalidateProducts(queryClient),
    })
}

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

export function useCreateVariant(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: VariantCreateInput) => catalogRepository.variants.create(productId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useUpdateVariant(productId: string, variantId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: VariantUpdateInput) => catalogRepository.variants.update(productId, variantId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useDeleteVariant(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (variantId: string) => catalogRepository.variants.delete(productId, variantId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useSetVariantStatus(productId: string, variantId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (status: CatalogStatus) =>
            status === "active"
                ? catalogRepository.variants.activate(productId, variantId)
                : catalogRepository.variants.deactivate(productId, variantId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useReorderVariants(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (items: ReorderItem[]) => catalogRepository.variants.reorder(productId, items),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useAddMedia(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: MediaCreateInput) => catalogRepository.media.create(productId, input),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useDeleteMedia(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (mediaId: string) => catalogRepository.media.delete(productId, mediaId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useSetPrimaryMedia(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (mediaId: string) => catalogRepository.media.setPrimary(productId, mediaId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useReorderMedia(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (items: ReorderItem[]) => catalogRepository.media.reorder(productId, items),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

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

export function useReplaceProductOutlets(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (outletIds: string[]) => catalogRepository.productOutlets.replace(productId, outletIds),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useRemoveProductOutlet(productId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (outletId: string) => catalogRepository.productOutlets.remove(productId, outletId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useSetOutletAssignmentStatus(productId: string, outletId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (status: CatalogStatus) =>
            status === "active"
                ? catalogRepository.productOutlets.activate(productId, outletId)
                : catalogRepository.productOutlets.deactivate(productId, outletId),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}

export function useSetOutletAvailability(productId: string, outletId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (availability: AvailabilityStatus) =>
            catalogRepository.productOutlets.setAvailability(productId, outletId, availability),
        onSuccess: () => invalidateProducts(queryClient, productId),
    })
}
