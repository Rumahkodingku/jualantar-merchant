import { describe, expect, it } from "vitest"

import { outletSchema } from "./outlet.schema"

const baseOutlet = {
    name: "Outlet Utama",
    phone: "",
    email: "",
    address: "Jl. Merdeka No. 1",
    province_id: 61,
    regency_id: 6101,
    district_id: 610101,
    village_id: 6101012001,
    postal_code: "78711",
    latitude: -0.5,
    longitude: 117.1,
    service_area_type: "radius" as const,
    service_radius_km: 5,
    hours: { monday: { is_open: true, open: "08:00", close: "17:00" } },
}

describe("outletSchema", () => {
    it("accepts a valid radius outlet", () => {
        expect(outletSchema.safeParse(baseOutlet).success).toBe(true)
    })

    it("requires a radius when service area is radius", () => {
        const result = outletSchema.safeParse({
            ...baseOutlet,
            service_radius_km: undefined,
        })

        expect(result.success).toBe(false)

        if (!result.success) {
            expect(result.error.issues.some((issue) => issue.path[0] === "service_radius_km")).toBe(true)
        }
    })

    it("does not require a radius for non-radius areas", () => {
        const result = outletSchema.safeParse({
            ...baseOutlet,
            service_area_type: "province",
            service_radius_km: undefined,
        })

        expect(result.success).toBe(true)
    })

    it("rejects out-of-range coordinates", () => {
        expect(outletSchema.safeParse({ ...baseOutlet, latitude: 120 }).success).toBe(false)
        expect(outletSchema.safeParse({ ...baseOutlet, longitude: -200 }).success).toBe(false)
    })

    it("rejects malformed operating hours", () => {
        const result = outletSchema.safeParse({
            ...baseOutlet,
            hours: { monday: { is_open: true, open: "8am", close: "17:00" } },
        })

        expect(result.success).toBe(false)
    })

    it("rejects the legacy slot-array format", () => {
        const result = outletSchema.safeParse({
            ...baseOutlet,
            hours: { monday: [{ open: "08:00", close: "17:00" }] },
        })

        expect(result.success).toBe(false)
    })

    it("rejects a closed day and a day without times", () => {
        expect(
            outletSchema.safeParse({
                ...baseOutlet,
                hours: { monday: { is_open: false } },
            }).success
        ).toBe(false)

        expect(
            outletSchema.safeParse({
                ...baseOutlet,
                hours: { monday: { is_open: true } },
            }).success
        ).toBe(false)
    })

    it("rejects a day whose close time is not after the open time", () => {
        const result = outletSchema.safeParse({
            ...baseOutlet,
            hours: { monday: { is_open: true, open: "17:00", close: "08:00" } },
        })

        expect(result.success).toBe(false)

        if (!result.success) {
            expect(result.error.issues.some((issue) => issue.message === "Jam tutup harus setelah jam buka.")).toBe(
                true
            )
        }
    })

    it("rejects a missing region selection", () => {
        const result = outletSchema.safeParse({ ...baseOutlet, village_id: 0 })

        expect(result.success).toBe(false)
    })
})
