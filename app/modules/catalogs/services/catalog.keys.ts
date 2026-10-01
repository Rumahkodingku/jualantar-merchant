import type { CategoryIndexParams, OutletCatalogIndexParams, ProductIndexParams } from "../types"

const ROOT = "catalogs"

export const catalogKeys = {
    productDraft: () => [ROOT, "product-draft"] as const,
    products: () => [ROOT, "products"] as const,
    productList: (params: ProductIndexParams = {}) => [ROOT, "products", "list", params] as const,
    product: (productId: string) => [ROOT, "product", productId] as const,
    productAssignments: (productId: string) => [ROOT, "product", productId, "assignments"] as const,
    categories: () => [ROOT, "categories"] as const,
    categoryList: (params: CategoryIndexParams = {}) => [ROOT, "categories", "list", params] as const,
    category: (categoryId: string) => [ROOT, "category", categoryId] as const,

    // Outlet catalog keys always carry the outlet id, so a cache for outlet A can
    // never be served to outlet B.
    outletCatalog: () => [ROOT, "outlet-catalog"] as const,
    outletCatalogFor: (outletId: string) => [ROOT, "outlet-catalog", outletId] as const,
    outletProductList: (outletId: string, params: OutletCatalogIndexParams = {}) =>
        [ROOT, "outlet-catalog", outletId, "list", params] as const,
    outletProduct: (outletId: string, productId: string) =>
        [ROOT, "outlet-catalog", outletId, "product", productId] as const,
}
