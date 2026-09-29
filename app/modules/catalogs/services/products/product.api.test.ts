import { afterEach, describe, expect, it, vi } from "vitest"

import { api } from "~/lib/api"

import { createProduct, deleteProduct, fetchProduct, fetchProducts, updateProduct } from "./product.api"

const PRODUCT_WIRE = {
    id: "p1",
    category_id: "c1",
    name: "Ayam Geprek",
    description: null,
    product_type: "simple" as const,
    price: "18000.00",
    status: "active" as const,
    display_order: 0,
    created_at: null,
    updated_at: null,
}

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

function singlePage<T>(data: T[]) {
    return { data, meta: { current_page: 1, per_page: 15, total: data.length, last_page: 1 } }
}

afterEach(() => {
    vi.restoreAllMocks()
})

describe("product api", () => {
    it("requests the product list with the caller's params", async () => {
        const get = vi.spyOn(api, "get").mockResolvedValue({ data: singlePage([PRODUCT_WIRE]) })

        await fetchProducts({ search: "Ayam", status: "active", sort: "name", order: "asc" })

        expect(get).toHaveBeenCalledWith("/merchant/catalog/products", {
            params: { search: "Ayam", status: "active", sort: "name", order: "asc" },
        })
    })

    it("normalizes decimal prices to numbers on the list", async () => {
        vi.spyOn(api, "get").mockResolvedValue({
            data: singlePage([PRODUCT_WIRE, { ...PRODUCT_WIRE, id: "p2", product_type: "variable", price: null }]),
        })

        const result = await fetchProducts()

        expect(result.data[0]?.price).toBe(18000)
        expect(result.data[1]?.price).toBeNull()
        expect(result.meta.total).toBe(2)
    })

    it("maps the category summary and the card counts on the list", async () => {
        vi.spyOn(api, "get").mockResolvedValue({
            data: singlePage([
                {
                    ...PRODUCT_WIRE,
                    product_type: "variable" as const,
                    price: null,
                    category: { id: "c1", name: "Makanan", status: "active" as const },
                    primary_media: { url: "https://cdn.test/ayam.jpg", alt_text: "Ayam" },
                    variants_count: 3,
                    min_price: "15000.00",
                    media_count: 2,
                    modifier_groups_count: 1,
                },
            ]),
        })

        const result = await fetchProducts()
        const product = result.data[0]

        expect(product?.category?.name).toBe("Makanan")
        expect(product?.primary_media?.url).toBe("https://cdn.test/ayam.jpg")
        expect(product?.variants_count).toBe(3)
        expect(product?.min_price).toBe(15_000)
        expect(product?.media_count).toBe(2)
        expect(product?.modifier_groups_count).toBe(1)
    })

    it("defaults the optional card fields when the payload omits them", async () => {
        vi.spyOn(api, "get").mockResolvedValue({ data: singlePage([PRODUCT_WIRE]) })

        const product = (await fetchProducts()).data[0]

        expect(product?.category).toBeNull()
        expect(product?.primary_media).toBeNull()
        expect(product?.variants_count).toBe(0)
        expect(product?.min_price).toBeNull()
        expect(product?.media_count).toBe(0)
        expect(product?.modifier_groups_count).toBe(0)
    })

    it("normalizes nested prices on the product detail", async () => {
        const get = vi.spyOn(api, "get").mockResolvedValue({
            data: {
                data: {
                    ...PRODUCT_WIRE,
                    variants: [VARIANT_WIRE],
                    media: [],
                    modifier_groups: [{ ...GROUP_WIRE, modifiers: [MODIFIER_WIRE] }],
                },
            },
        })

        const detail = await fetchProduct("p1")

        expect(get).toHaveBeenCalledWith("/merchant/catalog/products/p1")
        expect(detail.variants?.[0]?.price).toBe(15000)
        expect(detail.modifier_groups?.[0]?.modifiers[0]?.price).toBe(2000)
    })

    it("creates and updates products with the caller's payload", async () => {
        const post = vi.spyOn(api, "post").mockResolvedValue({ data: { data: PRODUCT_WIRE } })
        const patch = vi.spyOn(api, "patch").mockResolvedValue({ data: { data: PRODUCT_WIRE } })

        const created = await createProduct({
            category_id: "c1",
            name: "Ayam Geprek",
            product_type: "simple",
            price: 18000,
        })
        expect(post).toHaveBeenCalledWith("/merchant/catalog/products", {
            category_id: "c1",
            name: "Ayam Geprek",
            product_type: "simple",
            price: 18000,
        })
        expect(created.price).toBe(18000)

        await updateProduct("p1", { name: "Ayam Geprek Spesial" })
        expect(patch).toHaveBeenCalledWith("/merchant/catalog/products/p1", { name: "Ayam Geprek Spesial" })
    })

    it("resolves delete without a body", async () => {
        const del = vi.spyOn(api, "delete").mockResolvedValue({ data: null })

        await expect(deleteProduct("p1")).resolves.toBeUndefined()
        expect(del).toHaveBeenCalledWith("/merchant/catalog/products/p1")
    })
})
