import { describe, expect, it } from "vitest"

import { toProductDetail, type ProductDetailWire, type ProductVariantWire } from "./catalog.mappers"

function baseWire(overrides: Partial<ProductDetailWire> = {}): ProductDetailWire {
    return {
        id: "p1",
        category_id: "c1",
        name: "Nasi Goreng",
        description: null,
        product_type: "variable",
        price: null,
        status: "inactive",
        display_order: 0,
        created_at: null,
        updated_at: null,
        ...overrides,
    }
}

function variantWire(id: string, price: string, status: "active" | "inactive" = "active"): ProductVariantWire {
    return {
        id,
        name: `Variant ${id}`,
        sku: null,
        price,
        status,
        is_default: false,
        display_order: 0,
        created_at: null,
        updated_at: null,
    }
}

describe("toProductDetail summary", () => {
    it("maps a fixed price summary from the wire", () => {
        const detail = toProductDetail(
            baseWire({
                product_type: "simple",
                price: "15000.00",
                summary: {
                    price: { type: "fixed", value: 15000 },
                    variants_count: 0,
                    customization_groups_count: 0,
                    media_count: 2,
                    outlets_count: 1,
                },
            })
        )

        expect(detail.summary.price.type).toBe("fixed")
        expect(detail.summary.price.value).toBe(15000)
        expect(detail.summary.media_count).toBe(2)
        expect(detail.summary.outlets_count).toBe(1)
    })

    it("normalizes a string price value on a from summary", () => {
        const detail = toProductDetail(
            baseWire({
                summary: {
                    price: { type: "from", value: "13000.00" },
                    variants_count: 3,
                    customization_groups_count: 1,
                    media_count: 5,
                    outlets_count: 1,
                },
            })
        )

        expect(detail.summary.price.type).toBe("from")
        expect(detail.summary.price.value).toBe(13000)
        expect(detail.summary.variants_count).toBe(3)
        expect(detail.summary.customization_groups_count).toBe(1)
        expect(detail.summary.media_count).toBe(5)
    })

    it("keeps a null price value when there is no active variant", () => {
        const detail = toProductDetail(
            baseWire({
                summary: {
                    price: { type: "from", value: null },
                    variants_count: 2,
                    customization_groups_count: 0,
                    media_count: 0,
                    outlets_count: 0,
                },
            })
        )

        expect(detail.summary.price.type).toBe("from")
        expect(detail.summary.price.value).toBeNull()
    })

    it("derives the summary when the wire omits it, counting all variants", () => {
        const detail = toProductDetail(
            baseWire({
                variants: [
                    variantWire("v1", "15000.00", "active"),
                    variantWire("v2", "20000.00", "inactive"),
                    variantWire("v3", "13000.00", "active"),
                ],
                media: [
                    {
                        id: "m1",
                        url: "u",
                        alt_text: null,
                        mime_type: "image/jpeg",
                        file_size: null,
                        is_primary: true,
                        display_order: 0,
                        created_at: null,
                        updated_at: null,
                    },
                    {
                        id: "m2",
                        url: "u",
                        alt_text: null,
                        mime_type: "image/jpeg",
                        file_size: null,
                        is_primary: false,
                        display_order: 1,
                        created_at: null,
                        updated_at: null,
                    },
                ],
                modifier_groups: [],
            })
        )

        expect(detail.summary.price.type).toBe("from")
        expect(detail.summary.price.value).toBe(13000)
        expect(detail.summary.variants_count).toBe(3)
        expect(detail.summary.media_count).toBe(2)
        expect(detail.summary.outlets_count).toBe(0)
    })

    it("derives a fixed price for a simple product without summary", () => {
        const detail = toProductDetail(baseWire({ product_type: "simple", price: "18000.00", variants: [] }))

        expect(detail.summary.price.type).toBe("fixed")
        expect(detail.summary.price.value).toBe(18000)
        expect(detail.summary.variants_count).toBe(0)
    })

    it("derives a null from price when no variant is active", () => {
        const detail = toProductDetail(baseWire({ variants: [variantWire("v1", "15000.00", "inactive")] }))

        expect(detail.summary.price.type).toBe("from")
        expect(detail.summary.price.value).toBeNull()
    })
})
