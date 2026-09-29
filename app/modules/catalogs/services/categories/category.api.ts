import { api } from "~/lib/api"

import type {
    CatalogCategory,
    CategoryCreateInput,
    CategoryIndexParams,
    CategoryUpdateInput,
    PaginatedResponse,
    ReorderItem,
} from "../../types"

const BASE = "/merchant/catalog/categories"

function toReorderRequest(items: ReorderItem[]) {
    return { items: items.map((item) => ({ category_id: item.id, display_order: item.display_order })) }
}

export async function fetchCategories(params: CategoryIndexParams = {}): Promise<PaginatedResponse<CatalogCategory>> {
    const { data } = await api.get<PaginatedResponse<CatalogCategory>>(BASE, { params })

    return data
}

export async function fetchCategory(categoryId: string): Promise<CatalogCategory> {
    const { data } = await api.get<{ data: CatalogCategory }>(`${BASE}/${categoryId}`)

    return data.data
}

export async function createCategory(input: CategoryCreateInput): Promise<CatalogCategory> {
    const { data } = await api.post<{ data: CatalogCategory }>(BASE, input)

    return data.data
}

export async function updateCategory(categoryId: string, input: CategoryUpdateInput): Promise<CatalogCategory> {
    const { data } = await api.patch<{ data: CatalogCategory }>(`${BASE}/${categoryId}`, input)

    return data.data
}

export async function deleteCategory(categoryId: string): Promise<void> {
    await api.delete(`${BASE}/${categoryId}`)
}

export async function activateCategory(categoryId: string): Promise<CatalogCategory> {
    const { data } = await api.post<{ data: CatalogCategory }>(`${BASE}/${categoryId}/activate`)

    return data.data
}

export async function deactivateCategory(categoryId: string): Promise<CatalogCategory> {
    const { data } = await api.post<{ data: CatalogCategory }>(`${BASE}/${categoryId}/deactivate`)

    return data.data
}

export async function reorderCategories(items: ReorderItem[]): Promise<void> {
    await api.put(`${BASE}/order`, toReorderRequest(items))
}
