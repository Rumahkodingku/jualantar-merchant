import type {
    CatalogCategory,
    PaginatedResponse,
    Product,
    ProductDetail,
    ProductMedia,
    ProductModifier,
    ProductModifierGroup,
    ProductVariant,
} from "../types/catalog.types"
import { normalizePrice, normalizeRequiredPrice } from "../utils/normalize"

export type ProductWire = Omit<Product, "price"> & { price: string | null }
export type ProductVariantWire = Omit<ProductVariant, "price"> & { price: string }
export type ProductModifierWire = Omit<ProductModifier, "price"> & { price: string }
export type ProductModifierGroupWire = Omit<ProductModifierGroup, "modifiers" | "max_selection"> & {
    max_selection: number | null
    modifiers?: ProductModifierWire[]
}
export type ProductDetailWire = ProductWire & {
    category?: CatalogCategory
    variants?: ProductVariantWire[]
    media?: ProductMedia[]
    modifier_groups?: ProductModifierGroupWire[]
}

export function toProduct(wire: ProductWire): Product {
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

export function toProductVariant(wire: ProductVariantWire): ProductVariant {
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

export function toProductMedia(wire: ProductMedia): ProductMedia {
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

export function toProductModifier(wire: ProductModifierWire): ProductModifier {
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

export function toModifierGroup(wire: ProductModifierGroupWire): ProductModifierGroup {
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

export function toProductDetail(wire: ProductDetailWire): ProductDetail {
    return {
        ...toProduct(wire),
        category: wire.category,
        variants: wire.variants?.map(toProductVariant),
        media: wire.media?.map(toProductMedia),
        modifier_groups: wire.modifier_groups?.map(toModifierGroup),
    }
}

export async function fetchAllPages<TWire, TItem>(
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
