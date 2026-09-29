import { api } from "~/lib/api"

import { MAX_PER_PAGE, fetchAllPages } from "../pagination"
import { toProductVariant, type ProductVariantWire } from "../catalog.mappers"
import type {
    PaginatedResponse,
    ProductVariant,
    ReorderItem,
    VariantCreateInput,
    VariantIndexParams,
    VariantUpdateInput,
} from "../../types"

const BASE = "/merchant/catalog/products"

function productVariantsBase(productId: string) {
    return `${BASE}/${productId}/variants`
}

function toReorderRequest(items: ReorderItem[]) {
    return { items: items.map((item) => ({ variant_id: item.id, display_order: item.display_order })) }
}

export async function fetchProductVariants(
    productId: string,
    params: VariantIndexParams = {}
): Promise<ProductVariant[]> {
    return fetchAllPages(async (page) => {
        const { data } = await api.get<PaginatedResponse<ProductVariantWire>>(productVariantsBase(productId), {
            params: { ...params, per_page: MAX_PER_PAGE, page },
        })

        return data
    }, toProductVariant)
}

export async function createProductVariant(productId: string, input: VariantCreateInput): Promise<ProductVariant> {
    const { data } = await api.post<{ data: ProductVariantWire }>(productVariantsBase(productId), input)

    return toProductVariant(data.data)
}

export async function updateProductVariant(
    productId: string,
    variantId: string,
    input: VariantUpdateInput
): Promise<ProductVariant> {
    const { data } = await api.patch<{ data: ProductVariantWire }>(
        `${productVariantsBase(productId)}/${variantId}`,
        input
    )

    return toProductVariant(data.data)
}

export async function deleteProductVariant(productId: string, variantId: string): Promise<void> {
    await api.delete(`${productVariantsBase(productId)}/${variantId}`)
}

export async function activateProductVariant(productId: string, variantId: string): Promise<ProductVariant> {
    const { data } = await api.post<{ data: ProductVariantWire }>(
        `${productVariantsBase(productId)}/${variantId}/activate`
    )

    return toProductVariant(data.data)
}

export async function deactivateProductVariant(productId: string, variantId: string): Promise<ProductVariant> {
    const { data } = await api.post<{ data: ProductVariantWire }>(
        `${productVariantsBase(productId)}/${variantId}/deactivate`
    )

    return toProductVariant(data.data)
}

export async function reorderProductVariants(productId: string, items: ReorderItem[]): Promise<void> {
    await api.put(`${productVariantsBase(productId)}/order`, toReorderRequest(items))
}
