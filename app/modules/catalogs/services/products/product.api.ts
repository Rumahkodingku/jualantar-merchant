import { api } from "~/lib/api"

import { toProduct, toProductDetail, type ProductDetailWire, type ProductWire } from "../catalog.mappers"
import type {
    PaginatedResponse,
    Product,
    ProductCreateInput,
    ProductDetail,
    ProductIndexParams,
    ProductUpdateInput,
    ReorderItem,
} from "../../types"

const BASE = "/merchant/catalog/products"

/**
 * Every reorderable list sends `{ items: [{ <its own key>, display_order }] }`.
 * The shape is the same everywhere; only the key name changes.
 */
function toReorderRequest(items: ReorderItem[]) {
    return { items: items.map((item) => ({ product_id: item.id, display_order: item.display_order })) }
}

export async function fetchProducts(params: ProductIndexParams = {}): Promise<PaginatedResponse<Product>> {
    const { data } = await api.get<PaginatedResponse<ProductWire>>(BASE, { params })

    return { data: data.data.map(toProduct), meta: data.meta }
}

export async function fetchProduct(productId: string): Promise<ProductDetail> {
    const { data } = await api.get<{ data: ProductDetailWire }>(`${BASE}/${productId}`)

    return toProductDetail(data.data)
}

export async function createProduct(input: ProductCreateInput): Promise<Product> {
    const { data } = await api.post<{ data: ProductWire }>(BASE, input)

    return toProduct(data.data)
}

export async function updateProduct(productId: string, input: ProductUpdateInput): Promise<Product> {
    const { data } = await api.patch<{ data: ProductWire }>(`${BASE}/${productId}`, input)

    return toProduct(data.data)
}

export async function deleteProduct(productId: string): Promise<void> {
    await api.delete(`${BASE}/${productId}`)
}

export async function activateProduct(productId: string): Promise<Product> {
    const { data } = await api.post<{ data: ProductWire }>(`${BASE}/${productId}/activate`)

    return toProduct(data.data)
}

export async function deactivateProduct(productId: string): Promise<Product> {
    const { data } = await api.post<{ data: ProductWire }>(`${BASE}/${productId}/deactivate`)

    return toProduct(data.data)
}

export async function reorderProducts(items: ReorderItem[]): Promise<void> {
    await api.put(`${BASE}/order`, toReorderRequest(items))
}
