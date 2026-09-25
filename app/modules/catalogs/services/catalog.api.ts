import { api } from "~/lib/api"

import type {
    CatalogCategory,
    CategoryCreateInput,
    CategoryIndexParams,
    CategoryReorderRequest,
    CategoryUpdateInput,
    MediaIndexParams,
    MediaRegisterInput,
    MediaReorderRequest,
    MediaUploadTarget,
    MediaUploadUrlInput,
    ModifierCreateInput,
    ModifierGroupCreateInput,
    ModifierGroupReorderRequest,
    ModifierGroupUpdateInput,
    ModifierReorderRequest,
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
    ProductReorderRequest,
    ProductUpdateInput,
    ProductVariant,
    ReorderItem,
    VariantCreateInput,
    VariantIndexParams,
    VariantReorderRequest,
    VariantUpdateInput,
} from "../types/catalog.types"
import { normalizePrice, normalizeRequiredPrice } from "../utils/normalize"

const BASE = "/merchant/catalog"

export const MAX_PER_PAGE = 100

type ProductWire = Omit<Product, "price"> & { price: string | null }
type ProductVariantWire = Omit<ProductVariant, "price"> & { price: string }
type ProductModifierWire = Omit<ProductModifier, "price"> & { price: string }
type ProductModifierGroupWire = Omit<ProductModifierGroup, "modifiers" | "max_selection"> & {
    max_selection: number | null
    modifiers?: ProductModifierWire[]
}
type ProductDetailWire = ProductWire & {
    category?: CatalogCategory
    variants?: ProductVariantWire[]
    media?: ProductMedia[]
    modifier_groups?: ProductModifierGroupWire[]
}

function toProduct(wire: ProductWire): Product {
    return {
        id: wire.id,
        category_id: wire.category_id,
        name: wire.name,
        description: wire.description,
        product_type: wire.product_type,
        price: normalizePrice(wire.price),
        status: wire.status,
        display_order: wire.display_order,
        created_at: wire.created_at,
        updated_at: wire.updated_at,
    }
}

function toProductVariant(wire: ProductVariantWire): ProductVariant {
    return {
        id: wire.id,
        name: wire.name,
        sku: wire.sku,
        price: normalizeRequiredPrice(wire.price),
        status: wire.status,
        is_default: wire.is_default,
        display_order: wire.display_order,
        created_at: wire.created_at,
        updated_at: wire.updated_at,
    }
}

function toProductMedia(wire: ProductMedia): ProductMedia {
    return {
        id: wire.id,
        url: wire.url,
        alt_text: wire.alt_text,
        mime_type: wire.mime_type,
        file_size: wire.file_size,
        is_primary: wire.is_primary,
        display_order: wire.display_order,
        created_at: wire.created_at,
        updated_at: wire.updated_at,
    }
}

function toProductModifier(wire: ProductModifierWire): ProductModifier {
    return {
        id: wire.id,
        name: wire.name,
        description: wire.description,
        price: normalizeRequiredPrice(wire.price),
        is_default: wire.is_default,
        status: wire.status,
        display_order: wire.display_order,
        created_at: wire.created_at,
        updated_at: wire.updated_at,
    }
}

function toModifierGroup(wire: ProductModifierGroupWire): ProductModifierGroup {
    return {
        id: wire.id,
        name: wire.name,
        description: wire.description,
        selection_type: wire.selection_type,
        min_selection: wire.min_selection,
        max_selection: wire.max_selection,
        is_required: wire.is_required,
        status: wire.status,
        display_order: wire.display_order,
        created_at: wire.created_at,
        updated_at: wire.updated_at,
        modifiers: (wire.modifiers ?? []).map(toProductModifier),
    }
}

function toProductDetail(wire: ProductDetailWire): ProductDetail {
    return {
        ...toProduct(wire),
        category: wire.category,
        variants: wire.variants?.map(toProductVariant),
        media: wire.media?.map(toProductMedia),
        modifier_groups: wire.modifier_groups?.map(toModifierGroup),
    }
}

async function fetchAllPages<TWire, TItem>(
    fetchPage: (page: number) => Promise<PaginatedResponse<TWire>>,
    map: (wire: TWire) => TItem
): Promise<TItem[]> {
    const first = await fetchPage(1)
    const items = first.data.map(map)

    for (let page = 2; page <= first.meta.last_page; page += 1) {
        const next = await fetchPage(page)
        items.push(...next.data.map(map))
    }

    return items
}

export function toProductReorderRequest(items: ReorderItem[]): ProductReorderRequest {
    return { items: items.map((item) => ({ product_id: item.id, display_order: item.display_order })) }
}

export function toCategoryReorderRequest(items: ReorderItem[]): CategoryReorderRequest {
    return { items: items.map((item) => ({ category_id: item.id, display_order: item.display_order })) }
}

export function toVariantReorderRequest(items: ReorderItem[]): VariantReorderRequest {
    return { items: items.map((item) => ({ variant_id: item.id, display_order: item.display_order })) }
}

export function toMediaReorderRequest(items: ReorderItem[]): MediaReorderRequest {
    return { items: items.map((item) => ({ media_id: item.id, display_order: item.display_order })) }
}

export function toModifierGroupReorderRequest(items: ReorderItem[]): ModifierGroupReorderRequest {
    return { items: items.map((item) => ({ group_id: item.id, display_order: item.display_order })) }
}

export function toModifierReorderRequest(items: ReorderItem[]): ModifierReorderRequest {
    return { items: items.map((item) => ({ modifier_id: item.id, display_order: item.display_order })) }
}

export async function fetchProducts(params: ProductIndexParams = {}): Promise<PaginatedResponse<Product>> {
    const { data } = await api.get<PaginatedResponse<ProductWire>>(`${BASE}/products`, { params })

    return { data: data.data.map(toProduct), meta: data.meta }
}

export async function fetchProduct(productId: string): Promise<ProductDetail> {
    const { data } = await api.get<{ data: ProductDetailWire }>(`${BASE}/products/${productId}`)

    return toProductDetail(data.data)
}

export async function createProduct(input: ProductCreateInput): Promise<Product> {
    const { data } = await api.post<{ data: ProductWire }>(`${BASE}/products`, input)

    return toProduct(data.data)
}

export async function updateProduct(productId: string, input: ProductUpdateInput): Promise<Product> {
    const { data } = await api.patch<{ data: ProductWire }>(`${BASE}/products/${productId}`, input)

    return toProduct(data.data)
}

export async function deleteProduct(productId: string): Promise<void> {
    await api.delete(`${BASE}/products/${productId}`)
}

export async function activateProduct(productId: string): Promise<Product> {
    const { data } = await api.post<{ data: ProductWire }>(`${BASE}/products/${productId}/activate`)

    return toProduct(data.data)
}

export async function deactivateProduct(productId: string): Promise<Product> {
    const { data } = await api.post<{ data: ProductWire }>(`${BASE}/products/${productId}/deactivate`)

    return toProduct(data.data)
}

export async function reorderProducts(items: ReorderItem[]): Promise<void> {
    await api.put(`${BASE}/products/order`, toProductReorderRequest(items))
}

export async function fetchCategories(params: CategoryIndexParams = {}): Promise<PaginatedResponse<CatalogCategory>> {
    const { data } = await api.get<PaginatedResponse<CatalogCategory>>(`${BASE}/categories`, { params })

    return data
}

export async function fetchCategory(categoryId: string): Promise<CatalogCategory> {
    const { data } = await api.get<{ data: CatalogCategory }>(`${BASE}/categories/${categoryId}`)

    return data.data
}

export async function createCategory(input: CategoryCreateInput): Promise<CatalogCategory> {
    const { data } = await api.post<{ data: CatalogCategory }>(`${BASE}/categories`, input)

    return data.data
}

export async function updateCategory(categoryId: string, input: CategoryUpdateInput): Promise<CatalogCategory> {
    const { data } = await api.patch<{ data: CatalogCategory }>(`${BASE}/categories/${categoryId}`, input)

    return data.data
}

export async function deleteCategory(categoryId: string): Promise<void> {
    await api.delete(`${BASE}/categories/${categoryId}`)
}

export async function activateCategory(categoryId: string): Promise<CatalogCategory> {
    const { data } = await api.post<{ data: CatalogCategory }>(`${BASE}/categories/${categoryId}/activate`)

    return data.data
}

export async function deactivateCategory(categoryId: string): Promise<CatalogCategory> {
    const { data } = await api.post<{ data: CatalogCategory }>(`${BASE}/categories/${categoryId}/deactivate`)

    return data.data
}

export async function reorderCategories(items: ReorderItem[]): Promise<void> {
    await api.put(`${BASE}/categories/order`, toCategoryReorderRequest(items))
}

export async function fetchProductVariants(
    productId: string,
    params: VariantIndexParams = {}
): Promise<ProductVariant[]> {
    return fetchAllPages(async (page) => {
        const { data } = await api.get<PaginatedResponse<ProductVariantWire>>(
            `${BASE}/products/${productId}/variants`,
            { params: { ...params, per_page: MAX_PER_PAGE, page } }
        )

        return data
    }, toProductVariant)
}

export async function createProductVariant(productId: string, input: VariantCreateInput): Promise<ProductVariant> {
    const { data } = await api.post<{ data: ProductVariantWire }>(`${BASE}/products/${productId}/variants`, input)

    return toProductVariant(data.data)
}

export async function updateProductVariant(
    productId: string,
    variantId: string,
    input: VariantUpdateInput
): Promise<ProductVariant> {
    const { data } = await api.patch<{ data: ProductVariantWire }>(
        `${BASE}/products/${productId}/variants/${variantId}`,
        input
    )

    return toProductVariant(data.data)
}

export async function deleteProductVariant(productId: string, variantId: string): Promise<void> {
    await api.delete(`${BASE}/products/${productId}/variants/${variantId}`)
}

export async function activateProductVariant(productId: string, variantId: string): Promise<ProductVariant> {
    const { data } = await api.post<{ data: ProductVariantWire }>(
        `${BASE}/products/${productId}/variants/${variantId}/activate`
    )

    return toProductVariant(data.data)
}

export async function deactivateProductVariant(productId: string, variantId: string): Promise<ProductVariant> {
    const { data } = await api.post<{ data: ProductVariantWire }>(
        `${BASE}/products/${productId}/variants/${variantId}/deactivate`
    )

    return toProductVariant(data.data)
}

export async function reorderProductVariants(productId: string, items: ReorderItem[]): Promise<void> {
    await api.put(`${BASE}/products/${productId}/variants/order`, toVariantReorderRequest(items))
}

export async function fetchProductMedia(productId: string, params: MediaIndexParams = {}): Promise<ProductMedia[]> {
    return fetchAllPages(async (page) => {
        const { data } = await api.get<PaginatedResponse<ProductMedia>>(`${BASE}/products/${productId}/media`, {
            params: { ...params, per_page: MAX_PER_PAGE, page },
        })

        return data
    }, toProductMedia)
}

export async function createProductMediaUploadUrl(
    productId: string,
    input: MediaUploadUrlInput
): Promise<MediaUploadTarget> {
    const { data } = await api.post<{ data: MediaUploadTarget }>(
        `${BASE}/products/${productId}/media/upload-url`,
        input
    )

    return data.data
}

export async function createProductMedia(productId: string, input: MediaRegisterInput): Promise<ProductMedia> {
    const { data } = await api.post<{ data: ProductMedia }>(`${BASE}/products/${productId}/media`, input)

    return toProductMedia(data.data)
}

export async function deleteProductMedia(productId: string, mediaId: string): Promise<void> {
    await api.delete(`${BASE}/products/${productId}/media/${mediaId}`)
}

export async function setPrimaryProductMedia(productId: string, mediaId: string): Promise<ProductMedia> {
    const { data } = await api.post<{ data: ProductMedia }>(`${BASE}/products/${productId}/media/${mediaId}/primary`)

    return toProductMedia(data.data)
}

export async function reorderProductMedia(productId: string, items: ReorderItem[]): Promise<void> {
    await api.put(`${BASE}/products/${productId}/media/order`, toMediaReorderRequest(items))
}

export async function fetchProductModifierGroups(productId: string): Promise<ProductModifierGroup[]> {
    const { data } = await api.get<{ data: ProductModifierGroupWire[] }>(
        `${BASE}/products/${productId}/modifier-groups`
    )

    return data.data.map(toModifierGroup)
}

export async function createProductModifierGroup(
    productId: string,
    input: ModifierGroupCreateInput
): Promise<ProductModifierGroup> {
    const { data } = await api.post<{ data: ProductModifierGroupWire }>(
        `${BASE}/products/${productId}/modifier-groups`,
        input
    )

    return toModifierGroup(data.data)
}

export async function updateProductModifierGroup(
    productId: string,
    groupId: string,
    input: ModifierGroupUpdateInput
): Promise<ProductModifierGroup> {
    const { data } = await api.patch<{ data: ProductModifierGroupWire }>(
        `${BASE}/products/${productId}/modifier-groups/${groupId}`,
        input
    )

    return toModifierGroup(data.data)
}

export async function deleteProductModifierGroup(productId: string, groupId: string): Promise<void> {
    await api.delete(`${BASE}/products/${productId}/modifier-groups/${groupId}`)
}

export async function activateProductModifierGroup(productId: string, groupId: string): Promise<ProductModifierGroup> {
    const { data } = await api.post<{ data: ProductModifierGroupWire }>(
        `${BASE}/products/${productId}/modifier-groups/${groupId}/activate`
    )

    return toModifierGroup(data.data)
}

export async function deactivateProductModifierGroup(
    productId: string,
    groupId: string
): Promise<ProductModifierGroup> {
    const { data } = await api.post<{ data: ProductModifierGroupWire }>(
        `${BASE}/products/${productId}/modifier-groups/${groupId}/deactivate`
    )

    return toModifierGroup(data.data)
}

export async function reorderProductModifierGroups(productId: string, items: ReorderItem[]): Promise<void> {
    await api.put(`${BASE}/products/${productId}/modifier-groups/order`, toModifierGroupReorderRequest(items))
}

export async function fetchProductModifiers(productId: string, groupId: string): Promise<ProductModifier[]> {
    const { data } = await api.get<{ data: ProductModifierWire[] }>(
        `${BASE}/products/${productId}/modifier-groups/${groupId}/modifiers`
    )

    return data.data.map(toProductModifier)
}

export async function createProductModifier(
    productId: string,
    groupId: string,
    input: ModifierCreateInput
): Promise<ProductModifier> {
    const { data } = await api.post<{ data: ProductModifierWire }>(
        `${BASE}/products/${productId}/modifier-groups/${groupId}/modifiers`,
        input
    )

    return toProductModifier(data.data)
}

export async function updateProductModifier(
    productId: string,
    groupId: string,
    modifierId: string,
    input: ModifierUpdateInput
): Promise<ProductModifier> {
    const { data } = await api.patch<{ data: ProductModifierWire }>(
        `${BASE}/products/${productId}/modifier-groups/${groupId}/modifiers/${modifierId}`,
        input
    )

    return toProductModifier(data.data)
}

export async function deleteProductModifier(productId: string, groupId: string, modifierId: string): Promise<void> {
    await api.delete(`${BASE}/products/${productId}/modifier-groups/${groupId}/modifiers/${modifierId}`)
}

export async function activateProductModifier(
    productId: string,
    groupId: string,
    modifierId: string
): Promise<ProductModifier> {
    const { data } = await api.post<{ data: ProductModifierWire }>(
        `${BASE}/products/${productId}/modifier-groups/${groupId}/modifiers/${modifierId}/activate`
    )

    return toProductModifier(data.data)
}

export async function deactivateProductModifier(
    productId: string,
    groupId: string,
    modifierId: string
): Promise<ProductModifier> {
    const { data } = await api.post<{ data: ProductModifierWire }>(
        `${BASE}/products/${productId}/modifier-groups/${groupId}/modifiers/${modifierId}/deactivate`
    )

    return toProductModifier(data.data)
}

export async function reorderProductModifiers(productId: string, groupId: string, items: ReorderItem[]): Promise<void> {
    await api.put(
        `${BASE}/products/${productId}/modifier-groups/${groupId}/modifiers/order`,
        toModifierReorderRequest(items)
    )
}

export async function fetchProductOutlets(
    productId: string,
    params: OutletIndexParams = {}
): Promise<OutletProductAssignment[]> {
    return fetchAllPages(
        async (page) => {
            const { data } = await api.get<PaginatedResponse<OutletProductAssignment>>(
                `${BASE}/products/${productId}/outlets`,
                { params: { ...params, per_page: MAX_PER_PAGE, page } }
            )

            return data
        },
        (assignment) => assignment
    )
}

export async function assignProductOutlets(productId: string, outletIds: string[]): Promise<OutletProductAssignment[]> {
    const { data } = await api.post<{ data: OutletProductAssignment[] }>(`${BASE}/products/${productId}/outlets`, {
        outlet_ids: outletIds,
    })

    return data.data
}

export async function replaceProductOutlets(
    productId: string,
    outletIds: string[]
): Promise<OutletProductAssignment[]> {
    const { data } = await api.put<{ data: OutletProductAssignment[] }>(`${BASE}/products/${productId}/outlets`, {
        outlet_ids: outletIds,
    })

    return data.data
}

export async function removeProductOutlet(productId: string, outletId: string): Promise<void> {
    await api.delete(`${BASE}/products/${productId}/outlets/${outletId}`)
}

export async function activateProductOutlet(productId: string, outletId: string): Promise<OutletProductAssignment> {
    const { data } = await api.post<{ data: OutletProductAssignment }>(
        `${BASE}/products/${productId}/outlets/${outletId}/activate`
    )

    return data.data
}

export async function deactivateProductOutlet(productId: string, outletId: string): Promise<OutletProductAssignment> {
    const { data } = await api.post<{ data: OutletProductAssignment }>(
        `${BASE}/products/${productId}/outlets/${outletId}/deactivate`
    )

    return data.data
}

export async function updateProductOutletAvailability(
    productId: string,
    outletId: string,
    input: OutletAvailabilityInput
): Promise<OutletProductAssignment> {
    const { data } = await api.post<{ data: OutletProductAssignment }>(
        `${BASE}/products/${productId}/outlets/${outletId}/availability`,
        input
    )

    return data.data
}
