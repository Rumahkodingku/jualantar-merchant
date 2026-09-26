import { describe, expect, it } from "vitest"

import { emptyDraftData, productDraftSchema, submissionProgressSchema } from "./product-draft.schema"

describe("productDraftSchema", () => {
    it("parses a complete draft", () => {
        const parsed = productDraftSchema.parse({
            id: "d1",
            version: 3,
            step_index: 5,
            expires_at: "2026-09-27T10:00:00Z",
            updated_at: "2026-09-26T10:00:00Z",
            data: {
                info: {
                    name: "Burger Spesial",
                    category_id: "cat-1",
                    description: "Enak",
                    product_type: "variable",
                },
                price_raw: "",
                variants: [
                    {
                        key: "var-1",
                        name: "Reguler",
                        sku: "BRG-REG",
                        price: 18000,
                        status: "active",
                        is_default: true,
                    },
                ],
                modifier_groups: [
                    {
                        key: "grp-1",
                        name: "Pedas",
                        description: "",
                        selection_type: "single",
                        min_selection: 0,
                        max_selection: null,
                        is_required: false,
                        status: "active",
                        modifiers: [
                            {
                                key: "mod-1",
                                name: "Sedang",
                                description: "",
                                price: 0,
                                is_default: false,
                                status: "active",
                            },
                        ],
                    },
                ],
                media: [
                    {
                        key: "med-1",
                        object_key: "merchants/m1/drafts/a.jpg",
                        file_name: "burger.jpg",
                        mime_type: "image/jpeg",
                        file_size: 2048,
                        alt_text: null,
                        is_primary: true,
                        preview_url: "https://storage.test/a.jpg",
                    },
                ],
                outlet_ids: ["out-1"],
                submission: {
                    productId: "p1",
                    createdVariants: 1,
                    createdGroupIds: ["g1"],
                    createdModifierCounts: [2],
                    createdMedia: 1,
                    outletsReplaced: false,
                },
            },
        })

        expect(parsed.version).toBe(3)
        expect(parsed.step_index).toBe(5)
        expect(parsed.data.info.product_type).toBe("variable")
        expect(parsed.data.variants).toHaveLength(1)
        expect(parsed.data.modifier_groups[0]?.modifiers[0]?.name).toBe("Sedang")
        expect(parsed.data.media[0]?.preview_url).toBe("https://storage.test/a.jpg")
        expect(parsed.data.submission?.productId).toBe("p1")
    })

    it("falls back instead of throwing when sections are missing or malformed", () => {
        const parsed = productDraftSchema.parse({
            version: "not-a-number",
            step_index: 99,
            data: {
                info: { name: 42, product_type: "mystery" },
                price_raw: null,
                variants: "nope",
                modifier_groups: [{ name: "tanpa key" }],
                media: [{ object_key: "merchants/m1/drafts/b.jpg" }],
                outlet_ids: {},
            },
        })

        expect(parsed.id).toBe("")
        expect(parsed.version).toBe(0)
        expect(parsed.step_index).toBe(0)
        expect(parsed.data.info.name).toBe("")
        expect(parsed.data.info.product_type).toBe("simple")
        expect(parsed.data.price_raw).toBe("")
        expect(parsed.data.variants).toEqual([])
        expect(parsed.data.outlet_ids).toEqual([])
        expect(parsed.data.submission).toBeUndefined()
    })

    it("keeps a media entry that only has an object key", () => {
        const parsed = productDraftSchema.parse({
            data: { media: [{ object_key: "merchants/m1/drafts/c.jpg" }] },
        })

        expect(parsed.data.media).toEqual([
            {
                key: "",
                object_key: "merchants/m1/drafts/c.jpg",
                file_name: "",
                mime_type: "image/jpeg",
                file_size: 0,
                alt_text: null,
                is_primary: false,
                preview_url: null,
            },
        ])
    })

    it("treats submission as optional", () => {
        expect(productDraftSchema.parse({ data: {} }).data.submission).toBeUndefined()
    })
})

describe("submissionProgressSchema", () => {
    it("fills missing cursors with a no-op progress", () => {
        const parsed = submissionProgressSchema.parse({})

        expect(parsed).toEqual({
            productId: null,
            createdVariants: 0,
            createdGroupIds: [],
            createdModifierCounts: [],
            createdMedia: 0,
            outletsReplaced: false,
        })
    })

    it("preserves a half-finished submission", () => {
        const parsed = submissionProgressSchema.parse({
            productId: "p1",
            createdVariants: 2,
            createdGroupIds: ["g1", "g2"],
            createdModifierCounts: [3, 1],
            createdMedia: 0,
            outletsReplaced: false,
        })

        expect(parsed.createdVariants).toBe(2)
        expect(parsed.createdGroupIds).toEqual(["g1", "g2"])
    })
})
