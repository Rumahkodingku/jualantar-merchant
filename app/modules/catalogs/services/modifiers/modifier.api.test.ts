import { afterEach, describe, expect, it, vi } from "vitest"

import { api } from "~/lib/api"

import { fetchProductModifierGroups } from "./modifier.api"

const GROUP_WIRE = {
    id: "g1",
    name: "Pilihan Sambal",
    description: null,
    selection_type: "single" as const,
    min_selection: 1,
    max_selection: 1,
    is_required: true,
    status: "active" as const,
    display_order: 0,
    created_at: null,
    updated_at: null,
}

const MODIFIER_WIRE = {
    id: "mo1",
    name: "Sambal Mata",
    description: null,
    price: "2000.00",
    is_default: false,
    status: "active" as const,
    display_order: 0,
    created_at: null,
    updated_at: null,
}

afterEach(() => {
    vi.restoreAllMocks()
})

describe("modifier api", () => {
    it("does not paginate the group list the backend returns unpaginated", async () => {
        const get = vi.spyOn(api, "get").mockResolvedValue({
            data: { data: [{ ...GROUP_WIRE, modifiers: [MODIFIER_WIRE] }] },
        })

        const groups = await fetchProductModifierGroups("p1")

        expect(get).toHaveBeenCalledWith("/merchant/catalog/products/p1/modifier-groups")
        expect(groups[0]?.modifiers[0]?.price).toBe(2000)
    })
})
