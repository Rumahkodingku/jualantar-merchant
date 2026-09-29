import { afterEach, describe, expect, it, vi } from "vitest"

import { api } from "~/lib/api"

import { reorderCategories } from "./categories/category.api"
import { reorderProductMedia } from "./media/media.api"
import { reorderProductModifierGroups, reorderProductModifiers } from "./modifiers/modifier.api"
import { reorderProducts } from "./products/product.api"
import { reorderProductVariants } from "./variants/variant.api"

afterEach(() => {
    vi.restoreAllMocks()
})

/**
 * Reordering is the one place where every aggregate shares a convention rather
 * than a resource: the client sends the same `ReorderItem[]` everywhere and
 * each api file renames `id` onto its own primary key. This test is the guard
 * on that convention, so it covers all six lists side by side.
 */
describe("reorder requests", () => {
    it("maps reorder items to the resource-specific identifier the backend expects", async () => {
        const put = vi.spyOn(api, "put").mockResolvedValue({ data: null })

        await reorderProducts([{ id: "p1", display_order: 0 }])
        await reorderCategories([{ id: "c1", display_order: 1 }])
        await reorderProductVariants("p1", [{ id: "v1", display_order: 2 }])
        await reorderProductMedia("p1", [{ id: "m1", display_order: 3 }])
        await reorderProductModifierGroups("p1", [{ id: "g1", display_order: 4 }])
        await reorderProductModifiers("p1", "g1", [{ id: "mo1", display_order: 5 }])

        expect(put).toHaveBeenNthCalledWith(1, "/merchant/catalog/products/order", {
            items: [{ product_id: "p1", display_order: 0 }],
        })
        expect(put).toHaveBeenNthCalledWith(2, "/merchant/catalog/categories/order", {
            items: [{ category_id: "c1", display_order: 1 }],
        })
        expect(put).toHaveBeenNthCalledWith(3, "/merchant/catalog/products/p1/variants/order", {
            items: [{ variant_id: "v1", display_order: 2 }],
        })
        expect(put).toHaveBeenNthCalledWith(4, "/merchant/catalog/products/p1/media/order", {
            items: [{ media_id: "m1", display_order: 3 }],
        })
        expect(put).toHaveBeenNthCalledWith(5, "/merchant/catalog/products/p1/modifier-groups/order", {
            items: [{ group_id: "g1", display_order: 4 }],
        })
        expect(put).toHaveBeenNthCalledWith(6, "/merchant/catalog/products/p1/modifier-groups/g1/modifiers/order", {
            items: [{ modifier_id: "mo1", display_order: 5 }],
        })
    })
})
