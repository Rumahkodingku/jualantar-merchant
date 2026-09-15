import { afterEach, describe, expect, it, vi } from "vitest"

import { api } from "~/lib/api"

import {
    attachDocument,
    createOutlet,
    createRegistration,
    createRegistrationUpload,
    deleteDocument,
    deleteOutlet,
    fetchRegistration,
    reopenRegistration,
    saveCategories,
    saveService,
    submitRegistration,
    updateBusinessProfile,
} from "./merchant-registration.api"

afterEach(() => {
    vi.restoreAllMocks()
})

describe("merchant registration api", () => {
    it("fetches the registration detail", async () => {
        const spy = vi.spyOn(api, "get").mockResolvedValue({ data: { data: { id: "merchant-1" } } })

        const result = await fetchRegistration()

        expect(spy).toHaveBeenCalledWith("/merchants/registration")
        expect(result).toEqual({ id: "merchant-1" })
    })

    it("creates a draft with an empty payload", async () => {
        const spy = vi.spyOn(api, "post").mockResolvedValue({ data: { data: { merchant_id: "m1", status: "draft" } } })

        const result = await createRegistration()

        expect(spy).toHaveBeenCalledWith("/merchants/registration", {})
        expect(result.status).toBe("draft")
    })

    it("patches the business profile", async () => {
        const spy = vi.spyOn(api, "patch").mockResolvedValue({ data: { data: { id: "m1" } } })

        await updateBusinessProfile({
            business_name: "Warung",
            type: "individual",
        })

        expect(spy).toHaveBeenCalledWith("/merchants/registration", {
            business_name: "Warung",
            type: "individual",
        })
    })

    it("saves the service by id", async () => {
        const spy = vi.spyOn(api, "put").mockResolvedValue({ data: { data: { id: "m1" } } })

        await saveService("service-1")

        expect(spy).toHaveBeenCalledWith("/merchants/registration/service", {
            service_id: "service-1",
        })
    })

    it("saves categories as category_ids", async () => {
        const spy = vi.spyOn(api, "put").mockResolvedValue({ data: { data: { id: "m1" } } })

        await saveCategories(["a", "b"])

        expect(spy).toHaveBeenCalledWith("/merchants/registration/categories", {
            category_ids: ["a", "b"],
        })
    })

    it("creates an outlet", async () => {
        const spy = vi.spyOn(api, "post").mockResolvedValue({ data: { data: { id: "m1" } } })

        const payload = {
            name: "Outlet",
            address: "Jl",
            province_id: 1,
            regency_id: 1,
            district_id: 1,
            village_id: 1,
            postal_code: "1",
            latitude: 0,
            longitude: 0,
            service_area_type: "radius" as const,
            service_radius_km: 5,
        }

        await createOutlet(payload)

        expect(spy).toHaveBeenCalledWith("/merchants/registration/outlets", payload)
    })

    it("deletes an outlet", async () => {
        const spy = vi.spyOn(api, "delete").mockResolvedValue({ data: null })

        await deleteOutlet("outlet-1")

        expect(spy).toHaveBeenCalledWith("/merchants/registration/outlets/outlet-1")
    })

    it("requests a presigned upload", async () => {
        const spy = vi.spyOn(api, "post").mockResolvedValue({
            data: {
                data: {
                    object_key: "merchants/m1/logo/a.png",
                    upload_url: "https://upload.test",
                    headers: {},
                    expires_at: "2026-01-01T00:00:00Z",
                },
            },
        })

        const result = await createRegistrationUpload({
            purpose: "logo",
            file_name: "a.png",
            mime_type: "image/png",
            file_size: 10,
        })

        expect(spy).toHaveBeenCalledWith("/merchants/registration/uploads", {
            purpose: "logo",
            file_name: "a.png",
            mime_type: "image/png",
            file_size: 10,
        })
        expect(result.object_key).toBe("merchants/m1/logo/a.png")
    })

    it("attaches a document", async () => {
        const spy = vi.spyOn(api, "post").mockResolvedValue({ data: { data: { id: "doc-1" } } })

        await attachDocument({
            document_type: "ktp",
            object_key: "merchants/m1/documents/a.jpg",
            file_name: "a.jpg",
            mime_type: "image/jpeg",
            file_size: 10,
        })

        expect(spy).toHaveBeenCalledWith("/merchants/registration/documents", {
            document_type: "ktp",
            object_key: "merchants/m1/documents/a.jpg",
            file_name: "a.jpg",
            mime_type: "image/jpeg",
            file_size: 10,
        })
    })

    it("deletes a document", async () => {
        const spy = vi.spyOn(api, "delete").mockResolvedValue({ data: null })

        await deleteDocument("doc-1")

        expect(spy).toHaveBeenCalledWith("/merchants/registration/documents/doc-1")
    })

    it("submits the registration", async () => {
        const spy = vi
            .spyOn(api, "post")
            .mockResolvedValue({ data: { data: { merchant_id: "m1", status: "pending" } } })

        const result = await submitRegistration()

        expect(spy).toHaveBeenCalledWith("/merchants/registration/submit")
        expect(result.status).toBe("pending")
    })

    it("reopens a rejected registration", async () => {
        const spy = vi.spyOn(api, "post").mockResolvedValue({ data: { data: { merchant_id: "m1", status: "draft" } } })

        const result = await reopenRegistration()

        expect(spy).toHaveBeenCalledWith("/merchants/registration/reopen")
        expect(result.status).toBe("draft")
    })
})
