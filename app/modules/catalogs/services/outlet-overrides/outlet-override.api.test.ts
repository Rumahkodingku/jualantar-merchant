import { afterEach, describe, expect, it, vi } from "vitest"

import { api } from "~/lib/api"

import { clearOutletItemOverrides } from "./outlet-override.api"

/**
 * The owner's reset deliberately targets the *master* URL, not an outlet one:
 * clearing an override means "every outlet follows the master again", which is a
 * statement about the master item.
 */
describe("outlet override api", () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("clears a variant's overrides from the master endpoint", async () => {
        const del = vi.spyOn(api, "delete").mockResolvedValue({ data: null })

        await clearOutletItemOverrides("p1", { kind: "variant", itemId: "v1" })

        expect(del).toHaveBeenCalledWith("/merchant/catalog/products/p1/variants/v1/outlet-overrides")
    })

    it("clears a customization group's overrides", async () => {
        const del = vi.spyOn(api, "delete").mockResolvedValue({ data: null })

        await clearOutletItemOverrides("p1", { kind: "modifier_group", itemId: "g1" })

        expect(del).toHaveBeenCalledWith("/merchant/catalog/products/p1/modifier-groups/g1/outlet-overrides")
    })

    it("clears a customization option's overrides under its group", async () => {
        const del = vi.spyOn(api, "delete").mockResolvedValue({ data: null })

        await clearOutletItemOverrides("p1", {
            kind: "modifier",
            groupId: "g1",
            itemId: "m1",
        })

        expect(del).toHaveBeenCalledWith(
            "/merchant/catalog/products/p1/modifier-groups/g1/modifiers/m1/outlet-overrides"
        )
    })
})
