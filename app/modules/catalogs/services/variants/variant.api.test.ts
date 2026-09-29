import { afterEach, describe, expect, it, vi } from "vitest"

import { api } from "~/lib/api"

import { fetchProductVariants } from "./variant.api"

const VARIANT_WIRE = {
    id: "v1",
    name: "Regular",
    sku: "REG-1",
    price: "15000.00",
    status: "active" as const,
    is_default: true,
    display_order: 0,
    created_at: null,
    updated_at: null,
}

afterEach(() => {
    vi.restoreAllMocks()
})

describe("variant api", () => {
    it("drains every page and returns a plain array of normalized variants", async () => {
        const get = vi
            .spyOn(api, "get")
            .mockResolvedValueOnce({
                data: {
                    data: [VARIANT_WIRE],
                    meta: { current_page: 1, per_page: 100, total: 2, last_page: 2 },
                },
            })
            .mockResolvedValueOnce({
                data: {
                    data: [{ ...VARIANT_WIRE, id: "v2" }],
                    meta: { current_page: 2, per_page: 100, total: 2, last_page: 2 },
                },
            })

        const variants = await fetchProductVariants("p1")

        expect(get).toHaveBeenCalledTimes(2)
        expect(get).toHaveBeenNthCalledWith(1, "/merchant/catalog/products/p1/variants", {
            params: { per_page: 100, page: 1 },
        })
        expect(get).toHaveBeenNthCalledWith(2, "/merchant/catalog/products/p1/variants", {
            params: { per_page: 100, page: 2 },
        })
        expect(variants.map((variant) => variant.id)).toEqual(["v1", "v2"])
        expect(variants[0]?.price).toBe(15000)
    })
})
