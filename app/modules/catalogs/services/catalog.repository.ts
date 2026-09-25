import { apiCatalogRepository } from "./catalog.api.repository"

import type {
    CatalogCategory,
    CategoryCreateInput,
    CategoryIndexParams,
    CategoryUpdateInput,
    MediaRegisterInput,
    MediaUploadTarget,
    MediaUploadUrlInput,
    ModifierCreateInput,
    ModifierGroupCreateInput,
    ModifierGroupUpdateInput,
    ModifierUpdateInput,
    OutletAvailabilityInput,
    OutletIndexParams,
    OutletProductAssignment,
    PaginatedResponse,
    Product,
    ProductCreateInput,
    ProductDetail,
    ProductIndexParams,
    ProductMedia,
    ProductModifier,
    ProductModifierGroup,
    ProductUpdateInput,
    ProductVariant,
    ReorderItem,
    VariantCreateInput,
    VariantUpdateInput,
} from "../types/catalog.types"

export interface CatalogRepository {
    products: {
        list(params?: ProductIndexParams): Promise<PaginatedResponse<Product>>
        get(productId: string): Promise<ProductDetail>
        create(input: ProductCreateInput): Promise<Product>
        update(productId: string, input: ProductUpdateInput): Promise<Product>
        delete(productId: string): Promise<void>
        activate(productId: string): Promise<Product>
        deactivate(productId: string): Promise<Product>
        reorder(items: ReorderItem[]): Promise<void>
    }
    categories: {
        list(params?: CategoryIndexParams): Promise<PaginatedResponse<CatalogCategory>>
        get(categoryId: string): Promise<CatalogCategory>
        create(input: CategoryCreateInput): Promise<CatalogCategory>
        update(categoryId: string, input: CategoryUpdateInput): Promise<CatalogCategory>
        delete(categoryId: string): Promise<void>
        activate(categoryId: string): Promise<CatalogCategory>
        deactivate(categoryId: string): Promise<CatalogCategory>
        reorder(items: ReorderItem[]): Promise<void>
    }
    variants: {
        list(productId: string): Promise<ProductVariant[]>
        create(productId: string, input: VariantCreateInput): Promise<ProductVariant>
        update(productId: string, variantId: string, input: VariantUpdateInput): Promise<ProductVariant>
        delete(productId: string, variantId: string): Promise<void>
        activate(productId: string, variantId: string): Promise<ProductVariant>
        deactivate(productId: string, variantId: string): Promise<ProductVariant>
        reorder(productId: string, items: ReorderItem[]): Promise<void>
    }
    media: {
        list(productId: string): Promise<ProductMedia[]>
        createUploadUrl(productId: string, input: MediaUploadUrlInput): Promise<MediaUploadTarget>
        create(productId: string, input: MediaRegisterInput): Promise<ProductMedia>
        delete(productId: string, mediaId: string): Promise<void>
        setPrimary(productId: string, mediaId: string): Promise<ProductMedia>
        reorder(productId: string, items: ReorderItem[]): Promise<void>
    }
    modifierGroups: {
        list(productId: string): Promise<ProductModifierGroup[]>
        create(productId: string, input: ModifierGroupCreateInput): Promise<ProductModifierGroup>
        update(productId: string, groupId: string, input: ModifierGroupUpdateInput): Promise<ProductModifierGroup>
        delete(productId: string, groupId: string): Promise<void>
        activate(productId: string, groupId: string): Promise<ProductModifierGroup>
        deactivate(productId: string, groupId: string): Promise<ProductModifierGroup>
        reorder(productId: string, items: ReorderItem[]): Promise<void>
    }
    modifiers: {
        list(productId: string, groupId: string): Promise<ProductModifier[]>
        create(productId: string, groupId: string, input: ModifierCreateInput): Promise<ProductModifier>
        update(
            productId: string,
            groupId: string,
            modifierId: string,
            input: ModifierUpdateInput
        ): Promise<ProductModifier>
        delete(productId: string, groupId: string, modifierId: string): Promise<void>
        activate(productId: string, groupId: string, modifierId: string): Promise<ProductModifier>
        deactivate(productId: string, groupId: string, modifierId: string): Promise<ProductModifier>
        reorder(productId: string, groupId: string, items: ReorderItem[]): Promise<void>
    }
    productOutlets: {
        list(productId: string, params?: OutletIndexParams): Promise<OutletProductAssignment[]>
        assign(productId: string, outletIds: string[]): Promise<OutletProductAssignment[]>
        replace(productId: string, outletIds: string[]): Promise<OutletProductAssignment[]>
        remove(productId: string, outletId: string): Promise<void>
        activate(productId: string, outletId: string): Promise<OutletProductAssignment>
        deactivate(productId: string, outletId: string): Promise<OutletProductAssignment>
        setAvailability(
            productId: string,
            outletId: string,
            input: OutletAvailabilityInput
        ): Promise<OutletProductAssignment>
    }
}

export const catalogRepository: CatalogRepository = apiCatalogRepository
