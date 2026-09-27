import { describe, expect, it } from "vitest"

import { buildProductMeta } from "./product-meta"
import type { Product } from "../types/catalog.types"

const PRODUCT: Product = {
    id: "p1",
    category_id: "c1",
    name: "Ayam Geprek",
    description: null,
    product_type: "simple",
    price: 18_000,
    status: "active",
    display_order: 0,
    created_at: null,
    updated_at: null,
}

describe("buildProductMeta", () => {
    it("returns nothing when every count is missing or zero", () => {
        expect(buildProductMeta(PRODUCT)).toEqual([])
        expect(buildProductMeta({ ...PRODUCT, variants_count: 0, modifier_groups_count: 0, media_count: 0 })).toEqual(
            []
        )
    })

    it("reports the variant count", () => {
        expect(buildProductMeta({ ...PRODUCT, product_type: "variable", variants_count: 3 })).toEqual(["3 varian"])
    })

    it("reports customization and photo counts", () => {
        expect(buildProductMeta({ ...PRODUCT, modifier_groups_count: 2, media_count: 5 })).toEqual([
            "2 customization",
            "5 foto",
        ])
    })

    it("joins every non-zero count in order", () => {
        expect(buildProductMeta({ ...PRODUCT, variants_count: 4, modifier_groups_count: 2, media_count: 5 })).toEqual([
            "4 varian",
            "2 customization",
            "5 foto",
        ])
    })
})
