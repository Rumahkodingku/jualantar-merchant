import type { CatalogStatus, ProductType } from "../types/catalog.types"

export interface ProductFilterValues {
    search: string
    category_id: string
    status: "" | CatalogStatus
    product_type: "" | ProductType
}

export function readProductFilters(searchParams: URLSearchParams): ProductFilterValues {
    const status = searchParams.get("status") ?? ""
    const productType = searchParams.get("product_type") ?? ""

    return {
        search: searchParams.get("q") ?? "",
        category_id: searchParams.get("category_id") ?? "",
        status: status === "active" || status === "inactive" ? status : "",
        product_type: productType === "simple" || productType === "variable" ? productType : "",
    }
}
