import type { Product } from "../types"

export function buildProductMeta(product: Product): string[] {
    const parts: string[] = []

    if ((product.variants_count ?? 0) > 0) {
        parts.push(`${product.variants_count} varian`)
    }

    if ((product.modifier_groups_count ?? 0) > 0) {
        parts.push(`${product.modifier_groups_count} customization`)
    }

    if ((product.media_count ?? 0) > 0) {
        parts.push(`${product.media_count} foto`)
    }

    return parts
}
