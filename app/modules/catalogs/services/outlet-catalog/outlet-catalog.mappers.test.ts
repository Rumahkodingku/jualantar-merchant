import { describe, expect, it } from "vitest"

import { toOutletCatalogItem, type OutletCatalogItemWire } from "./outlet-catalog.mappers"

function makeWire(overrides: Partial<OutletCatalogItemWire> = {}): OutletCatalogItemWire {
    return {
        product: {
            id: "p1",
            name: "Ayam Geprek",
            description: null,
            product_type: "simple",
            price: "18000",
            status: "active",
        },
        category: { id: "c1", name: "Makanan", status: "active" },
        variants: [],
        primary_media: null,
        modifier_groups: [],
        assignment: {
            id: "a1",
            status: "active",
            availability_status: "available",
            unavailable_reason: null,
            display_order: 0,
        },
        is_sellable: true,
        ...overrides,
    }
}

describe("toOutletCatalogItem", () => {
    it("normalizes the product price to a number", () => {
        const item = toOutletCatalogItem(makeWire())

        expect(item.product.price).toBe(18000)
    })

    it("keeps a null price for a variable product", () => {
        const item = toOutletCatalogItem(
            makeWire({ product: { ...makeWire().product, product_type: "variable", price: null } })
        )

        expect(item.product.price).toBeNull()
    })

    it("defaults missing category and assignment to null", () => {
        const item = toOutletCatalogItem(makeWire({ category: null, assignment: null }))

        expect(item.category).toBeNull()
        expect(item.assignment).toBeNull()
    })

    it("maps variants with numeric prices", () => {
        const item = toOutletCatalogItem(
            makeWire({
                product: { ...makeWire().product, product_type: "variable", price: null },
                variants: [
                    {
                        id: "v1",
                        name: "Reguler",
                        sku: null,
                        price: "20000",
                        status: "active",
                        is_default: true,
                    },
                ],
            })
        )

        expect(item.variants).toHaveLength(1)
        expect(item.variants[0]?.price).toBe(20000)
    })

    it("maps modifier groups through the shared mapper", () => {
        const item = toOutletCatalogItem(
            makeWire({
                modifier_groups: [
                    {
                        id: "g1",
                        name: "Level Pedas",
                        description: null,
                        selection_type: "single",
                        min_selection: 1,
                        max_selection: 1,
                        is_required: true,
                        status: "active",
                        display_order: 0,
                        created_at: null,
                        updated_at: null,
                    },
                ],
            })
        )

        expect(item.modifier_groups).toHaveLength(1)
        expect(item.modifier_groups[0]?.name).toBe("Level Pedas")
        expect(item.modifier_groups[0]?.modifiers).toEqual([])
    })

    it("passes is_sellable through unchanged", () => {
        expect(toOutletCatalogItem(makeWire({ is_sellable: false })).is_sellable).toBe(false)
    })
})
