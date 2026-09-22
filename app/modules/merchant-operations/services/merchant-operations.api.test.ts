import { afterEach, describe, expect, it, vi } from "vitest"

import { api } from "~/lib/api"

import {
    changeOutletEmployeeRole,
    createOperationalUpload,
    createOutlet,
    createOutletEmployee,
    deactivateOutlet,
    fetchAvailability,
    fetchOperationalProfile,
    fetchOperationsSummary,
    fetchOperatingHours,
    fetchOutlets,
    removeOutletEmployee,
    suspendMerchant,
    updateOperatingHours,
    updateOperationalProfile,
    updateServiceArea,
} from "./merchant-operations.api"

afterEach(() => {
    vi.restoreAllMocks()
})

describe("merchant operations api", () => {
    it("fetches the operations summary", async () => {
        const spy = vi.spyOn(api, "get").mockResolvedValue({
            data: {
                data: {
                    merchant: { id: "m1", business_name: "Warung", status: "active" },
                    operational: { status: "active" },
                },
            },
        })

        const result = await fetchOperationsSummary()

        expect(spy).toHaveBeenCalledWith("/merchant/operations")
        expect(result.merchant.status).toBe("active")
    })

    it("fetches and updates the operational profile", async () => {
        const getSpy = vi.spyOn(api, "get").mockResolvedValue({
            data: { data: { id: "m1", business_name: "Warung", operational_phone: "0812" } },
        })
        const patchSpy = vi.spyOn(api, "patch").mockResolvedValue({
            data: { data: { id: "m1", business_name: "Warung Baru" } },
        })

        await fetchOperationalProfile()
        expect(getSpy).toHaveBeenCalledWith("/merchant/operations/profile")

        await updateOperationalProfile({ business_name: "Warung Baru", website: null })
        expect(patchSpy).toHaveBeenCalledWith("/merchant/operations/profile", {
            business_name: "Warung Baru",
            website: null,
        })
    })

    it("posts a merchant status transition", async () => {
        const spy = vi.spyOn(api, "post").mockResolvedValue({ data: { data: { status: "suspended" } } })

        await suspendMerchant()

        expect(spy).toHaveBeenCalledWith("/merchant/operations/suspend")
    })

    it("requests an operational upload", async () => {
        const spy = vi.spyOn(api, "post").mockResolvedValue({
            data: { data: { object_key: "merchants/m1/logo/a.png", upload_url: "https://up", headers: {} } },
        })

        const result = await createOperationalUpload({
            purpose: "logo",
            file_name: "a.png",
            mime_type: "image/png",
            file_size: 10,
        })

        expect(spy).toHaveBeenCalledWith("/merchant/operations/uploads", {
            purpose: "logo",
            file_name: "a.png",
            mime_type: "image/png",
            file_size: 10,
        })
        expect(result.object_key).toBe("merchants/m1/logo/a.png")
    })

    it("returns the paginated outlet list with meta", async () => {
        const spy = vi.spyOn(api, "get").mockResolvedValue({
            data: { data: [{ id: "o1" }], meta: { current_page: 1, per_page: 10, total: 3, last_page: 1 } },
        })

        const result = await fetchOutlets({ search: "utama", status: "active", page: 1, per_page: 10 })

        expect(spy).toHaveBeenCalledWith("/merchant/operations/outlets", {
            params: { search: "utama", status: "active", page: 1, per_page: 10 },
        })
        expect(result.meta.total).toBe(3)
    })

    it("creates an outlet and toggles its status", async () => {
        const postSpy = vi.spyOn(api, "post").mockResolvedValue({ data: { data: { id: "o1" } } })

        await createOutlet({
            name: "Outlet",
            address: "Jl. Test",
            province_id: 61,
            regency_id: 6106,
            district_id: 610601,
            village_id: 6106012001,
            postal_code: "78711",
            latitude: 0.84,
            longitude: 112.93,
        })
        expect(postSpy).toHaveBeenCalledWith(
            "/merchant/operations/outlets",
            expect.objectContaining({ name: "Outlet" })
        )

        await deactivateOutlet("o1")
        expect(postSpy).toHaveBeenCalledWith("/merchant/operations/outlets/o1/deactivate")
    })

    it("creates an outlet employee on the employees endpoint", async () => {
        const spy = vi.spyOn(api, "post").mockResolvedValue({
            data: { data: { role: "outlet_staff", user: { id: "u1", email: "a@b.c", phone: null } } },
        })

        const result = await createOutletEmployee("o1", {
            email: "a@b.c",
            password: "password123",
            password_confirmation: "password123",
            role: "outlet_staff",
        })

        expect(spy).toHaveBeenCalledWith("/merchant/operations/outlets/o1/employees", {
            email: "a@b.c",
            password: "password123",
            password_confirmation: "password123",
            role: "outlet_staff",
        })
        expect(result.user?.id).toBe("u1")
    })

    it("changes and removes an outlet employee assignment", async () => {
        const patchSpy = vi.spyOn(api, "patch").mockResolvedValue({ data: { data: { role: "outlet_manager" } } })
        const deleteSpy = vi.spyOn(api, "delete").mockResolvedValue({ data: null })

        await changeOutletEmployeeRole("o1", "u1", "outlet_manager")
        expect(patchSpy).toHaveBeenCalledWith("/merchant/operations/outlets/o1/users/u1", {
            role: "outlet_manager",
        })

        await removeOutletEmployee("o1", "u1")
        expect(deleteSpy).toHaveBeenCalledWith("/merchant/operations/outlets/o1/users/u1")
    })

    it("normalizes an empty operating-hours payload to an object", async () => {
        vi.spyOn(api, "get").mockResolvedValue({ data: { data: [] } })
        await expect(fetchOperatingHours("o1")).resolves.toEqual({})

        const putSpy = vi.spyOn(api, "put").mockResolvedValue({ data: { data: [] } })
        await expect(
            updateOperatingHours("o1", {
                monday: { is_open: true, open: "08:00", close: "22:00" },
                tuesday: { is_open: false },
                wednesday: { is_open: false },
                thursday: { is_open: false },
                friday: { is_open: false },
                saturday: { is_open: false },
                sunday: { is_open: false },
            })
        ).resolves.toEqual({})
        expect(putSpy).toHaveBeenCalledWith(
            "/merchant/operations/outlets/o1/operating-hours",
            expect.objectContaining({ monday: { is_open: true, open: "08:00", close: "22:00" } })
        )
    })

    it("sends only the fields valid for the selected service area type", async () => {
        const spy = vi.spyOn(api, "put").mockResolvedValue({ data: { data: { type: "regency", regency_id: 6106 } } })

        const result = await updateServiceArea("o1", { type: "regency", regency_id: 6106 })

        expect(spy).toHaveBeenCalledWith("/merchant/operations/outlets/o1/service-area", {
            type: "regency",
            regency_id: 6106,
        })
        expect(result.type).toBe("regency")
    })

    it("fetches the derived availability", async () => {
        const spy = vi.spyOn(api, "get").mockResolvedValue({
            data: {
                data: {
                    status: "closed",
                    reason: "outside_operating_hours",
                    merchant_status: "active",
                    outlet_status: "active",
                    schedule: { open: "08:00", close: "22:00" },
                },
            },
        })

        const result = await fetchAvailability("o1")

        expect(spy).toHaveBeenCalledWith("/merchant/operations/outlets/o1/availability")
        expect(result.reason).toBe("outside_operating_hours")
    })
})
