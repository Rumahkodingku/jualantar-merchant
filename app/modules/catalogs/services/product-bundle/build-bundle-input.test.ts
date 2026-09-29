import { describe, expect, it } from "vitest"

import { buildBundleInput } from "./build-bundle-input"
import type { GroupDraft, MediaDraft, VariantDraft } from "../../types/product-draft.types"

function base() {
    return {
        info: { name: "Ayam Geprek", category_id: "c1", description: "", product_type: "simple" as const },
        priceRaw: "18000",
        variants: [] as VariantDraft[],
        groups: [] as GroupDraft[],
        media: [] as MediaDraft[],
        outletIds: [] as string[],
    }
}

const VARIANT: VariantDraft = {
    key: "var-1",
    name: "Jumbo",
    sku: "",
    price: 22000,
    status: "active",
    is_default: true,
}

const GROUP: GroupDraft = {
    key: "grp-1",
    name: "Level Pedas",
    description: "",
    selection_type: "single",
    min_selection: 1,
    max_selection: 1,
    is_required: true,
    status: "active",
    modifiers: [{ key: "mod-1", name: "Mata", description: "", price: 2000, is_default: false, status: "active" }],
}

function MEDIA(overrides: Partial<MediaDraft> = {}): MediaDraft {
    return {
        key: "med-1",
        object_key: "merchants/m1/products/p1/a.jpg",
        file_name: "a.jpg",
        mime_type: "image/jpeg",
        file_size: 1000,
        preview_url: "https://cdn.test/a.jpg",
        alt_text: "",
        is_primary: true,
        status: "ready",
        ...overrides,
    }
}

describe("buildBundleInput", () => {
    it("reads a simple product's price out of the text field", () => {
        const input = buildBundleInput(base())

        expect(input.product.price).toBe(18000)
        expect(input.variants).toEqual([])
    })

    it("leaves the price null on a variable product, which gets it from its variants", () => {
        const input = buildBundleInput({
            ...base(),
            info: { ...base().info, product_type: "variable" },
            variants: [VARIANT],
        })

        expect(input.product.price).toBeNull()
        expect(input.variants).toEqual([{ name: "Jumbo", sku: null, price: 22000, is_default: true }])
    })

    it("sends the product's own description as it stands, empty text included", () => {
        const input = buildBundleInput(base())

        // Unlike a group's description, this one is not normalised to null —
        // see the note on the function.
        expect(input.product.description).toBe("")
        expect(input.modifierGroups).toEqual([])
    })

    it("sends a blank modifier description as null too", () => {
        const input = buildBundleInput({ ...base(), groups: [GROUP] })

        expect(input.modifierGroups[0]).toEqual({
            group: {
                name: "Level Pedas",
                description: null,
                selection_type: "single",
                min_selection: 1,
                max_selection: 1,
                is_required: true,
            },
            modifiers: [{ name: "Mata", description: null, price: 2000, is_default: false }],
        })
    })

    it("leaves out a photo that is still uploading", () => {
        const input = buildBundleInput({
            ...base(),
            media: [MEDIA(), MEDIA({ key: "med-2", object_key: "", status: "uploading" })],
        })

        expect(input.media).toEqual([
            { object_key: "merchants/m1/products/p1/a.jpg", alt_text: null, is_primary: true },
        ])
    })

    it("passes the chosen outlets through untouched", () => {
        const input = buildBundleInput({ ...base(), outletIds: ["o1", "o2"] })

        expect(input.outletIds).toEqual(["o1", "o2"])
    })
})
