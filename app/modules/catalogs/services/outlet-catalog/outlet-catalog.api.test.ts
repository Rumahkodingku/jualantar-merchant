import { afterEach, describe, expect, it, vi } from "vitest"

import { api } from "~/lib/api"

import { fetchOutletProduct, fetchOutletProducts, reorderOutletProducts } from "./outlet-catalog.api"
import type { OutletCatalogItemWire } from "./outlet-catalog.mappers"

const ITEM_WIRE: OutletCatalogItemWire = {
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
}

function singlePage<T>(data: T[]) {
    return { data, meta: { current_page: 1, per_page: 15, total: data.length, last_page: 1 } }
}

afterEach(() => {
    vi.restoreAllMocks()
})

describe("outlet catalog api", () => {
    it("lists outlet products from the outlet-scoped endpoint with params", async () => {
        const get = vi.spyOn(api, "get").mockResolvedValue({ data: singlePage([ITEM_WIRE]) })

        await fetchOutletProducts("o1", { search: "Ayam", availability: "available" })

        expect(get).toHaveBeenCalledWith("/merchant/catalog/outlets/o1/products", {
            params: { search: "Ayam", availability: "available" },
        })
    })

    it("normalizes prices and keeps is_sellable on the list", async () => {
        vi.spyOn(api, "get").mockResolvedValue({ data: singlePage([ITEM_WIRE]) })

        const result = await fetchOutletProducts("o1")

        expect(result.data[0]?.product.price).toBe(18000)
        expect(result.data[0]?.is_sellable).toBe(true)
        expect(result.meta.total).toBe(1)
    })

    it("fetches detail from the outlet-scoped endpoint, never the master one", async () => {
        const get = vi.spyOn(api, "get").mockResolvedValue({ data: { data: ITEM_WIRE } })

        const item = await fetchOutletProduct("o1", "p1")

        expect(get).toHaveBeenCalledWith("/merchant/catalog/outlets/o1/products/p1")
        expect(item.product.id).toBe("p1")
    })

    it("reorders through the outlet-scoped order endpoint", async () => {
        const put = vi.spyOn(api, "put").mockResolvedValue({ data: null })

        await expect(reorderOutletProducts("o1", [{ product_id: "p1", display_order: 0 }])).resolves.toBeUndefined()

        expect(put).toHaveBeenCalledWith("/merchant/catalog/outlets/o1/products/order", {
            items: [{ product_id: "p1", display_order: 0 }],
        })
    })
})
