import { afterEach, describe, expect, it, vi } from "vitest"

import { api } from "~/lib/api"

import { createProductMedia, createProductMediaUploadUrl, fetchProductMedia } from "./media.api"

afterEach(() => {
    vi.restoreAllMocks()
})

describe("media api", () => {
    it("requests media with a full page", async () => {
        const get = vi.spyOn(api, "get").mockResolvedValue({
            data: { data: [], meta: { current_page: 1, per_page: 100, total: 0, last_page: 1 } },
        })

        await fetchProductMedia("p1")

        expect(get).toHaveBeenCalledWith("/merchant/catalog/products/p1/media", {
            params: { per_page: 100, page: 1 },
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
