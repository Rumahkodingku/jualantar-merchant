import type {
    CatalogCategory,
    PaginatedResponse,
    Product,
    ProductDetail,
    ProductDetailPriceSummary,
    ProductDetailSummary,
    ProductMedia,
    ProductModifier,
    ProductModifierGroup,
    ProductPrimaryMedia,
    ProductVariant,
} from "../types/catalog.types"
import { normalizePrice, normalizeRequiredPrice } from "../utils/normalize"

export type ProductWire = Omit<Product, "price" | "primary_media" | "min_price"> & {
    price: string | null
    primary_media?: ProductPrimaryMedia | null
    min_price?: string | null
}
export type ProductVariantWire = Omit<ProductVariant, "price"> & { price: string }
export type ProductModifierWire = Omit<ProductModifier, "price"> & { price: string }
export type ProductModifierGroupWire = Omit<ProductModifierGroup, "modifiers" | "max_selection"> & {
    max_selection: number | null
    modifiers?: ProductModifierWire[]
}
export interface ProductDetailPriceSummaryWire {
    type: "fixed" | "from"
    value: number | string | null
}

export interface ProductDetailSummaryWire {
    price: ProductDetailPriceSummaryWire
    variants_count: number
    customization_groups_count: number
    media_count: number
    outlets_count: number
}

export type ProductDetailWire = ProductWire & {
    category?: CatalogCategory
    summary?: ProductDetailSummaryWire
    variants?: ProductVariantWire[]
    media?: ProductMedia[]
    modifier_groups?: ProductModifierGroupWire[]
}

export function toProduct(wire: ProductWire): Product {
    return {
        id: wire.id,
        category_id: wire.category_id,
        category: wire.category ?? null,
        name: wire.name,
        description: wire.description,
        product_type: wire.product_type,
        price: normalizePrice(wire.price),
        status: wire.status,
        display_order: wire.display_order,
        primary_media: wire.primary_media ?? null,
        variants_count: wire.variants_count ?? 0,
        min_price: normalizePrice(wire.min_price),
        media_count: wire.media_count ?? 0,
        modifier_groups_count: wire.modifier_groups_count ?? 0,
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

function toSummaryPrice(wire: ProductDetailPriceSummaryWire): ProductDetailPriceSummary {
    return { type: wire.type, value: normalizePrice(wire.value) }
}

function deriveSummary(wire: ProductDetailWire): ProductDetailSummary {
    const variants = wire.variants ?? []
    const isVariable = wire.product_type === "variable"
    const activePrices = variants
        .filter((variant) => variant.status === "active")
        .map((variant) => normalizeRequiredPrice(variant.price))

    return {
        price: {
            type: isVariable ? "from" : "fixed",
            value: isVariable
                ? activePrices.length > 0
                    ? Math.min(...activePrices)
                    : null
                : normalizePrice(wire.price),
        },
        variants_count: variants.length,
        customization_groups_count: (wire.modifier_groups ?? []).length,
        media_count: (wire.media ?? []).length,
        outlets_count: 0,
    }
}

export function toProductDetail(wire: ProductDetailWire): ProductDetail {
    const summary: ProductDetailSummary =
        wire.summary !== undefined
            ? {
                  price: toSummaryPrice(wire.summary.price),
                  variants_count: wire.summary.variants_count,
                  customization_groups_count: wire.summary.customization_groups_count,
                  media_count: wire.summary.media_count,
                  outlets_count: wire.summary.outlets_count,
              }
            : deriveSummary(wire)

    return {
        ...toProduct(wire),
        category: wire.category,
        summary,
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
