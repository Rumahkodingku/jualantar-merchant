import type { CategoryIndexParams, ProductIndexParams } from "../types/catalog.types"

const ROOT = "catalogs"

export const catalogKeys = {
    all: [ROOT] as const,
    productDraft: () => [ROOT, "product-draft"] as const,
    products: () => [ROOT, "products"] as const,
    productList: (params: ProductIndexParams = {}) => [ROOT, "products", "list", params] as const,
    product: (productId: string) => [ROOT, "product", productId] as const,
    productAssignments: (productId: string) => [ROOT, "product", productId, "assignments"] as const,
    categories: () => [ROOT, "categories"] as const,
    categoryList: (params: CategoryIndexParams = {}) => [ROOT, "categories", "list", params] as const,
    category: (categoryId: string) => [ROOT, "category", categoryId] as const,
}
