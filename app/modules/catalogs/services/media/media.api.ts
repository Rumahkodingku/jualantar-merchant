import { api } from "~/lib/api"

import { MAX_PER_PAGE, fetchAllPages } from "../pagination"
import { toProductMedia } from "../catalog.mappers"
import type {
    MediaIndexParams,
    MediaRegisterInput,
    MediaUploadTarget,
    MediaUploadUrlInput,
    PaginatedResponse,
    ProductMedia,
    ReorderItem,
} from "../../types"

const BASE = "/merchant/catalog/products"

function productMediaBase(productId: string) {
    return `${BASE}/${productId}/media`
}

function toReorderRequest(items: ReorderItem[]) {
    return { items: items.map((item) => ({ media_id: item.id, display_order: item.display_order })) }
}

export async function fetchProductMedia(productId: string, params: MediaIndexParams = {}): Promise<ProductMedia[]> {
    return fetchAllPages(async (page) => {
        const { data } = await api.get<PaginatedResponse<ProductMedia>>(productMediaBase(productId), {
            params: { ...params, per_page: MAX_PER_PAGE, page },
        })

        return data
    }, toProductMedia)
}

export async function createProductMediaUploadUrl(
    productId: string,
    input: MediaUploadUrlInput
): Promise<MediaUploadTarget> {
    const { data } = await api.post<{ data: MediaUploadTarget }>(`${productMediaBase(productId)}/upload-url`, input)

    return data.data
}

export async function createProductMedia(productId: string, input: MediaRegisterInput): Promise<ProductMedia> {
    const { data } = await api.post<{ data: ProductMedia }>(productMediaBase(productId), input)

    return toProductMedia(data.data)
}

export async function deleteProductMedia(productId: string, mediaId: string): Promise<void> {
    await api.delete(`${productMediaBase(productId)}/${mediaId}`)
}

export async function setPrimaryProductMedia(productId: string, mediaId: string): Promise<ProductMedia> {
    const { data } = await api.post<{ data: ProductMedia }>(`${productMediaBase(productId)}/${mediaId}/primary`)

    return toProductMedia(data.data)
}

export async function reorderProductMedia(productId: string, items: ReorderItem[]): Promise<void> {
    await api.put(`${productMediaBase(productId)}/order`, toReorderRequest(items))
}
