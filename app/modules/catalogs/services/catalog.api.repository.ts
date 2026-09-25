import * as catalogApi from "./catalog.api"

import type { CatalogRepository } from "./catalog.repository"

type ApiCatalogRepository = CatalogRepository

export const apiCatalogRepository = {
    products: {
        list: catalogApi.fetchProducts,
        get: catalogApi.fetchProduct,
        create: catalogApi.createProduct,
        update: catalogApi.updateProduct,
        delete: catalogApi.deleteProduct,
        activate: catalogApi.activateProduct,
        deactivate: catalogApi.deactivateProduct,
        reorder: catalogApi.reorderProducts,
    },
    categories: {
        list: catalogApi.fetchCategories,
        get: catalogApi.fetchCategory,
        create: catalogApi.createCategory,
        update: catalogApi.updateCategory,
        delete: catalogApi.deleteCategory,
        activate: catalogApi.activateCategory,
        deactivate: catalogApi.deactivateCategory,
        reorder: catalogApi.reorderCategories,
    },
    variants: {
        list: catalogApi.fetchProductVariants,
        create: catalogApi.createProductVariant,
        update: catalogApi.updateProductVariant,
        delete: catalogApi.deleteProductVariant,
        activate: catalogApi.activateProductVariant,
        deactivate: catalogApi.deactivateProductVariant,
        reorder: catalogApi.reorderProductVariants,
    },
    media: {
        list: catalogApi.fetchProductMedia,
        createUploadUrl: catalogApi.createProductMediaUploadUrl,
        create: catalogApi.createProductMedia,
        delete: catalogApi.deleteProductMedia,
        setPrimary: catalogApi.setPrimaryProductMedia,
        reorder: catalogApi.reorderProductMedia,
    },
    modifierGroups: {
        list: catalogApi.fetchProductModifierGroups,
        create: catalogApi.createProductModifierGroup,
        update: catalogApi.updateProductModifierGroup,
        delete: catalogApi.deleteProductModifierGroup,
        activate: catalogApi.activateProductModifierGroup,
        deactivate: catalogApi.deactivateProductModifierGroup,
        reorder: catalogApi.reorderProductModifierGroups,
    },
    modifiers: {
        list: catalogApi.fetchProductModifiers,
        create: catalogApi.createProductModifier,
        update: catalogApi.updateProductModifier,
        delete: catalogApi.deleteProductModifier,
        activate: catalogApi.activateProductModifier,
        deactivate: catalogApi.deactivateProductModifier,
        reorder: catalogApi.reorderProductModifiers,
    },
    productOutlets: {
        list: catalogApi.fetchProductOutlets,
        assign: catalogApi.assignProductOutlets,
        replace: catalogApi.replaceProductOutlets,
        remove: catalogApi.removeProductOutlet,
        activate: catalogApi.activateProductOutlet,
        deactivate: catalogApi.deactivateProductOutlet,
        setAvailability: catalogApi.updateProductOutletAvailability,
    },
} satisfies ApiCatalogRepository
