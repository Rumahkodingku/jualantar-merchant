import { describe, expect, it } from "vitest"

import { buildEditPlan } from "./build-edit-plan"
import { isPlanEmpty } from "./edit-plan.types"
import type {
    EditForm,
    EditSnapshot,
    GroupDraft,
    MediaDraft,
    ProductMedia,
    ProductModifierGroup,
    ProductVariant,
    VariantDraft,
} from "../../types"

/**
 * The plan is the only thing standing between a form the merchant edited and a
 * product on the server, and a mistake in it is silent: a row that should have
 * been updated quietly is not, or a row that should have been kept is deleted.
 * These tests pin the three decisions the whole thing rests on — a row with a
 * server id is a patch, a row without one is a create, and a row in the snapshot
 * that is no longer in the form is a removal — and the one that carries the most
 * risk, which is the order removals are applied in.
 */

function form(overrides: Partial<EditForm> = {}): EditForm {
    return {
        info: { name: "Ayam Geprek", category_id: "c1", description: "", product_type: "simple" },
        priceRaw: "18000",
        variants: [],
        groups: [],
        media: [],
        outletIds: [],
        ...overrides,
    }
}

function snapshot(overrides: Partial<EditSnapshot> = {}): EditSnapshot {
    return {
        name: "Ayam Geprek",
        category_id: "c1",
        description: null,
        price: 18000,
        outletIds: [],
        variants: [],
        groups: [],
        media: [],
        ...overrides,
    }
}

function variant(overrides: Partial<ProductVariant> = {}): ProductVariant {
    return {
        id: "v1",
        name: "Reguler",
        sku: null,
        price: 18000,
        status: "active",
        is_default: true,
        display_order: 0,
        created_at: null,
        updated_at: null,
        ...overrides,
    }
}

function variantDraft(overrides: Partial<VariantDraft> = {}): VariantDraft {
    return {
        key: "var-1",
        name: "Reguler",
        sku: "",
        price: 18000,
        status: "active",
        is_default: true,
        ...overrides,
    }
}

function modifier(id: string, overrides: Partial<ProductModifierGroup["modifiers"][number]> = {}) {
    return {
        id,
        name: `Opsi ${id}`,
        description: null,
        price: 2000,
        is_default: false,
        status: "active" as const,
        display_order: 0,
        created_at: null,
        updated_at: null,
        ...overrides,
    }
}

function group(overrides: Partial<ProductModifierGroup> = {}): ProductModifierGroup {
    return {
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
        modifiers: [modifier("m1")],
        ...overrides,
    }
}

function groupDraft(overrides: Partial<GroupDraft> = {}): GroupDraft {
    return {
        key: "grp-1",
        name: "Level Pedas",
        description: "",
        selection_type: "single",
        min_selection: 1,
        max_selection: 1,
        is_required: true,
        status: "active",
        modifiers: [],
        ...overrides,
    }
}

function media(overrides: Partial<ProductMedia> = {}): ProductMedia {
    return {
        id: "med-1",
        url: "https://cdn.test/a.jpg",
        alt_text: null,
        mime_type: "image/jpeg",
        file_size: 1000,
        is_primary: true,
        display_order: 0,
        created_at: null,
        updated_at: null,
        ...overrides,
    }
}

function mediaDraft(overrides: Partial<MediaDraft> = {}): MediaDraft {
    return {
        key: "med-1",
        object_key: "",
        file_name: "",
        mime_type: "image/jpeg",
        file_size: 1000,
        preview_url: "https://cdn.test/a.jpg",
        alt_text: "",
        is_primary: true,
        status: "ready",
        ...overrides,
    }
}

describe("an untouched product needs no requests at all", () => {
    it("plans nothing for a form that matches the snapshot exactly", () => {
        const plan = buildEditPlan({ form: form(), snapshot: snapshot() })

        expect(isPlanEmpty(plan)).toBe(true)
    })

    it("plans nothing when the merchant only walked through the steps", () => {
        const plan = buildEditPlan({
            form: form({ variants: [variantDraft({ id: "v1" })] }),
            snapshot: snapshot({ variants: [variant()] }),
        })

        expect(isPlanEmpty(plan)).toBe(true)
    })
})

describe("the product's own fields", () => {
    it("patches only what moved", () => {
        const plan = buildEditPlan({
            form: form({ info: { ...form().info, name: "Ayam Geprek Sambal" } }),
            snapshot: snapshot(),
        })

        expect(plan.product).toEqual({
            name: "Ayam Geprek Sambal",
            category_id: "c1",
            description: null,
            price: 18000,
        })
    })

    it("leaves the price to a variable product's variants", () => {
        const plan = buildEditPlan({
            form: form({
                info: { name: "Nasi Goreng", category_id: "c1", description: "", product_type: "variable" },
                priceRaw: "",
            }),
            snapshot: snapshot({ price: null }),
        })

        // The name changed, so there is a patch — and it says the price is null
        // rather than omitting the field, which the API could read as "unchanged".
        expect(plan.product).toEqual({
            name: "Nasi Goreng",
            category_id: "c1",
            description: null,
            price: null,
        })
    })

    it("turns a cleared description into null rather than an empty string", () => {
        const plan = buildEditPlan({
            form: form({ info: { ...form().info, description: "Enak" } }),
            snapshot: snapshot(),
        })

        expect(plan.product?.description).toBe("Enak")

        const cleared = buildEditPlan({ form: form(), snapshot: snapshot({ description: "Enak" }) })

        expect(cleared.product?.description).toBeNull()
    })
})

describe("variants are told apart by their server id", () => {
    it("updates a row whose id it recognises", () => {
        const plan = buildEditPlan({
            form: form({ variants: [variantDraft({ id: "v1", price: 20000 })] }),
            snapshot: snapshot({ variants: [variant()] }),
        })

        expect(plan.variants.update).toEqual([{ id: "v1", update: { price: 20000 }, status: null }])
        expect(plan.variants.create).toEqual([])
        expect(plan.variants.remove).toEqual([])
    })

    it("creates a row with no id", () => {
        const plan = buildEditPlan({
            form: form({ variants: [variantDraft({ key: "var-new", name: "Jumbo", price: 25000 })], priceRaw: "" }),
            snapshot: snapshot({ variants: [variant()] }),
        })

        expect(plan.variants.create).toEqual([{ name: "Jumbo", sku: null, price: 25000, is_default: true }])
    })

    it("removes a row the snapshot has and the form does not", () => {
        const plan = buildEditPlan({
            form: form({ variants: [] }),
            snapshot: snapshot({ variants: [variant({ id: "v1" }), variant({ id: "v2", name: "Jumbo" })] }),
        })

        expect(plan.variants.remove).toEqual(["v1", "v2"])
    })

    it("carries a status change beside the patch rather than inside it", () => {
        const plan = buildEditPlan({
            form: form({ variants: [variantDraft({ id: "v1", status: "inactive" })] }),
            snapshot: snapshot({ variants: [variant()] }),
        })

        // The variant endpoints have no status field; it moves through
        // activate/deactivate, so the plan has to say which direction.
        expect(plan.variants.update).toEqual([{ id: "v1", update: {}, status: "inactive" }])
    })

    it("plans a reorder when the surviving rows moved", () => {
        const plan = buildEditPlan({
            form: form({
                variants: [variantDraft({ id: "v2", key: "b" }), variantDraft({ id: "v1", key: "a" })],
                priceRaw: "",
            }),
            snapshot: snapshot({
                variants: [variant({ id: "v1" }), variant({ id: "v2", name: "Jumbo" })],
            }),
        })

        expect(plan.variants.reorder).toEqual([
            { id: "v2", display_order: 0 },
            { id: "v1", display_order: 1 },
        ])
    })

    it("reads a cleared SKU as null, which is how the API spells an absent one", () => {
        const plan = buildEditPlan({
            form: form({ variants: [variantDraft({ id: "v1", sku: "" })] }),
            snapshot: snapshot({ variants: [variant({ sku: "REG-1" })] }),
        })

        expect(plan.variants.update).toEqual([{ id: "v1", update: { sku: null }, status: null }])
    })
})

describe("customization groups and their options", () => {
    it("updates a group whose name moved, with no status change", () => {
        const plan = buildEditPlan({
            form: form({
                groups: [groupDraft({ id: "g1", name: "Level Pedas Extreme" })],
                priceRaw: "",
            }),
            snapshot: snapshot({ groups: [group()] }),
        })

        expect(plan.customization.groups.update[0].update).toEqual({ name: "Level Pedas Extreme" })
        expect(plan.customization.groups.update[0].status).toBeNull()
    })

    it("creates a whole group with its options in one go", () => {
        const plan = buildEditPlan({
            form: form({
                groups: [
                    groupDraft({
                        key: "grp-new",
                        name: "Topping",
                        modifiers: [
                            {
                                key: "mod-new",
                                name: "Keju",
                                description: "",
                                price: 3000,
                                is_default: false,
                                status: "active",
                            },
                        ],
                    }),
                ],
                priceRaw: "",
            }),
            snapshot: snapshot(),
        })

        expect(plan.customization.groups.create).toHaveLength(1)
        expect(plan.customization.groups.create[0].modifiers).toEqual([
            { name: "Keju", description: null, price: 3000, is_default: false },
        ])
    })

    it("separates a removed option from a removed group, so neither is lost", () => {
        const plan = buildEditPlan({
            form: form({ groups: [groupDraft({ id: "g1", modifiers: [] })], priceRaw: "" }),
            snapshot: snapshot({ groups: [group({ modifiers: [modifier("m1"), modifier("m2")] })] }),
        })

        expect(plan.customization.groups.update[0].modifiers.remove).toEqual(["m1", "m2"])
        expect(plan.customization.groups.remove).toEqual([])
    })

    it("reports a group that is going away as removed, not as an update", () => {
        const plan = buildEditPlan({
            form: form({ groups: [], priceRaw: "" }),
            snapshot: snapshot({ groups: [group()] }),
        })

        expect(plan.customization.groups.remove).toEqual(["g1"])
        expect(plan.customization.groups.update).toEqual([])
    })

    it("does not confuse a duplicated group for the one it was copied from", () => {
        // The copy has no id, so it is a new group; the original stays.
        const plan = buildEditPlan({
            form: form({
                groups: [groupDraft({ id: "g1" }), groupDraft({ key: "grp-copy", name: "Level Pedas (salinan)" })],
                priceRaw: "",
            }),
            snapshot: snapshot({ groups: [group()] }),
        })

        expect(plan.customization.groups.create).toHaveLength(1)
        expect(plan.customization.groups.remove).toEqual([])
    })
})

describe("photos", () => {
    it("keeps a photo the product already has, and removes one that is gone", () => {
        const plan = buildEditPlan({
            form: form({ media: [mediaDraft({ id: "med-1" })] }),
            snapshot: snapshot({
                media: [media({ id: "med-1" }), media({ id: "med-2", url: "https://cdn.test/b.jpg" })],
            }),
        })

        expect(plan.media.remove).toEqual(["med-2"])
        expect(plan.media.create).toEqual([])
    })

    it("registers a photo that was just uploaded, in the order it sits on screen", () => {
        const plan = buildEditPlan({
            form: form({
                media: [
                    mediaDraft({ key: "new", object_key: "catalog/new.jpg", is_primary: true, preview_url: "blob:x" }),
                    mediaDraft({ key: "old", id: "med-1" }),
                ],
            }),
            snapshot: snapshot({ media: [media({ id: "med-1" })] }),
        })

        expect(plan.media.create).toEqual([
            { object_key: "catalog/new.jpg", alt_text: null, is_primary: true, display_order: 0 },
        ])
    })

    it("leaves out a photo that is still uploading — its bytes are not stored yet", () => {
        const plan = buildEditPlan({
            form: form({ media: [mediaDraft({ key: "busy", object_key: "", status: "uploading" })] }),
            snapshot: snapshot(),
        })

        expect(plan.media.create).toEqual([])
    })

    it("sets the lead photo through its own endpoint when it already exists", () => {
        const plan = buildEditPlan({
            form: form({
                media: [
                    mediaDraft({ id: "med-1", is_primary: false }),
                    mediaDraft({ key: "med-2", id: "med-2", is_primary: true }),
                ],
            }),
            snapshot: snapshot({
                media: [media({ id: "med-1" }), media({ id: "med-2", url: "https://cdn.test/b.jpg" })],
            }),
        })

        expect(plan.media.primaryId).toBe("med-2")
    })

    it("has no lead to set when the cover is a photo that does not exist yet", () => {
        const plan = buildEditPlan({
            form: form({ media: [mediaDraft({ key: "new", object_key: "catalog/new.jpg", is_primary: true })] }),
            snapshot: snapshot(),
        })

        // The new photo claims the lead through its own create call instead.
        expect(plan.media.primaryId).toBeNull()
        expect(plan.media.create[0].is_primary).toBe(true)
    })
})

describe("outlets", () => {
    it("replaces nothing when the picks are the same ones", () => {
        const plan = buildEditPlan({
            form: form({ outletIds: ["o1", "o2"] }),
            snapshot: snapshot({ outletIds: ["o1", "o2"] }),
        })

        expect(plan.outlets.replace).toBeNull()
    })

    it("replaces the whole list when one outlet is dropped", () => {
        const plan = buildEditPlan({
            form: form({ outletIds: ["o1"] }),
            snapshot: snapshot({ outletIds: ["o1", "o2"] }),
        })

        expect(plan.outlets.replace).toEqual(["o1"])
    })

    it("notices a reorder, which is a change even though the set is the same", () => {
        const plan = buildEditPlan({
            form: form({ outletIds: ["o2", "o1"] }),
            snapshot: snapshot({ outletIds: ["o1", "o2"] }),
        })

        expect(plan.outlets.replace).toEqual(["o2", "o1"])
    })
})
