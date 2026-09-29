import { afterEach, describe, expect, it, vi } from "vitest"

import { api } from "~/lib/api"

import { fetchProductOutlets, updateProductOutletAvailability } from "./product-outlet.api"

afterEach(() => {
    vi.restoreAllMocks()
})

describe("product outlet api", () => {
    it("requests the outlet assignment list with a single full page", async () => {
        const get = vi.spyOn(api, "get").mockResolvedValue({
            data: {
                data: [{ id: "asg1", product_id: "p1", outlet_id: "o1", status: "active" }],
                meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
            },
        })

        const assignments = await fetchProductOutlets("p1")

        expect(get).toHaveBeenCalledWith("/merchant/catalog/products/p1/outlets", {
            params: { per_page: 100, page: 1 },
        })
        expect(assignments).toHaveLength(1)
    })

    it("sends the availability status without a reason when available", async () => {
        const post = vi.spyOn(api, "post").mockResolvedValue({ data: { data: { id: "asg1" } } })

        await updateProductOutletAvailability("p1", "o1", { status: "available" })

        expect(post).toHaveBeenCalledWith("/merchant/catalog/products/p1/outlets/o1/availability", {
            status: "available",
        })
    })

    it("sends an optional reason when marking an outlet unavailable", async () => {
        const post = vi.spyOn(api, "post").mockResolvedValue({ data: { data: { id: "asg1" } } })

        await updateProductOutletAvailability("p1", "o1", { status: "unavailable", reason: "Stok habis" })

        expect(post).toHaveBeenCalledWith("/merchant/catalog/products/p1/outlets/o1/availability", {
            status: "unavailable",
            reason: "Stok habis",
        })
    })
})
