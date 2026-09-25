import { afterEach, describe, expect, it, vi } from "vitest"

import { api } from "~/lib/api"

import {
    createProduct,
    createProductMedia,
    createProductMediaUploadUrl,
    deleteProduct,
    fetchProduct,
    fetchProductMedia,
    fetchProductModifierGroups,
    fetchProductOutlets,
    fetchProducts,
    fetchProductVariants,
    reorderCategories,
    reorderProductMedia,
    reorderProductModifierGroups,
    reorderProductModifiers,
    reorderProducts,
    reorderProductVariants,
    updateProduct,
    updateProductOutletAvailability,
} from "./catalog.api"

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

describe("catalog api", () => {
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

    it("drains every page of a paginated child list and returns a plain array", async () => {
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

    it("does not paginate the child lists the backend returns unpaginated", async () => {
        const get = vi.spyOn(api, "get").mockResolvedValue({
            data: { data: [{ ...GROUP_WIRE, modifiers: [MODIFIER_WIRE] }] },
        })

        const groups = await fetchProductModifierGroups("p1")

        expect(get).toHaveBeenCalledWith("/merchant/catalog/products/p1/modifier-groups")
        expect(groups[0]?.modifiers[0]?.price).toBe(2000)
    })

    it("requests the outlet assignment list with a single full page", async () => {
        const get = vi.spyOn(api, "get").mockResolvedValue({
            data: singlePage([{ id: "asg1", product_id: "p1", outlet_id: "o1", status: "active" }]),
        })

        const assignments = await fetchProductOutlets("p1")

        expect(get).toHaveBeenCalledWith("/merchant/catalog/products/p1/outlets", {
            params: { per_page: 100, page: 1 },
        })
        expect(assignments).toHaveLength(1)
    })

    it("requests media with a full page too", async () => {
        const get = vi.spyOn(api, "get").mockResolvedValue({ data: singlePage([]) })

        await fetchProductMedia("p1")

        expect(get).toHaveBeenCalledWith("/merchant/catalog/products/p1/media", {
            params: { per_page: 100, page: 1 },
        })
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

    it("requests a presigned upload target from the product's media endpoint", async () => {
        const post = vi.spyOn(api, "post").mockResolvedValue({
            data: {
                data: {
                    object_key: "merchants/m1/products/p1/abc.jpg",
                    upload_url: "https://storage.example/abc",
                    headers: { "Content-Type": "image/jpeg" },
                    expires_at: "2026-09-25T10:00:00+00:00",
                },
            },
        })

        const target = await createProductMediaUploadUrl("p1", {
            file_name: "ayam-geprek.jpg",
            mime_type: "image/jpeg",
            file_size: 245760,
        })

        expect(post).toHaveBeenCalledWith("/merchant/catalog/products/p1/media/upload-url", {
            file_name: "ayam-geprek.jpg",
            mime_type: "image/jpeg",
            file_size: 245760,
        })
        expect(target.object_key).toBe("merchants/m1/products/p1/abc.jpg")
    })

    it("registers media with the object key only", async () => {
        const post = vi.spyOn(api, "post").mockResolvedValue({
            data: {
                data: {
                    id: "med1",
                    url: "https://storage.example/signed",
                    alt_text: null,
                    mime_type: "image/jpeg",
                    file_size: 245760,
                    is_primary: true,
                    display_order: 0,
                    created_at: null,
                    updated_at: null,
                },
            },
        })

        const media = await createProductMedia("p1", {
            object_key: "merchants/m1/products/p1/abc.jpg",
            is_primary: true,
        })

        expect(post).toHaveBeenCalledWith("/merchant/catalog/products/p1/media", {
            object_key: "merchants/m1/products/p1/abc.jpg",
            is_primary: true,
        })
        expect(media.is_primary).toBe(true)
    })
})
