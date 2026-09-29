import { describe, expect, it } from "vitest"

import type { OperationalOutlet } from "~/modules/merchant-operations"

import { formatGeography, formatOutletLocation } from "./outlet-location"

function outlet(overrides: Partial<OperationalOutlet> = {}): OperationalOutlet {
    return {
        id: "o1",
        merchant_id: "mch-001",
        name: "Outlet Utama",
        phone: null,
        email: null,
        address: "Jl. Merdeka No. 1",
        province_id: 1,
        regency_id: 2,
        district_id: 3,
        village_id: 4,
        postal_code: "60111",
        latitude: "-7.25790500",
        longitude: "112.75212000",
        service_area_type: "radius",
        service_radius_km: "5.00",
        operating_hours: null,
        photos: [],
        photos_url: [],
        status: "active",
        geography: {
            village: "Tunjungan",
            district: "Klojen",
            regency: "Malang",
            province: "Jawa Timur",
        },
        created_at: null,
        updated_at: null,
        ...overrides,
    }
}

describe("formatGeography", () => {
    it("joins the four levels from the most specific to the widest", () => {
        expect(formatGeography(outlet().geography)).toBe("Tunjungan, Klojen, Malang, Jawa Timur")
    })

    it("collapses consecutive levels that repeat the same name", () => {
        const geography = {
            village: "Tunjungan",
            district: "Tunjungan",
            regency: "Surabaya",
            province: "Jawa Timur",
        }

        expect(formatGeography(geography)).toBe("Tunjungan, Surabaya, Jawa Timur")
    })

    it("keeps a name that repeats on non-adjacent levels", () => {
        const geography = {
            village: "Malang",
            district: "Klojen",
            regency: "Malang",
            province: "Jawa Timur",
        }

        expect(formatGeography(geography)).toBe("Malang, Klojen, Malang, Jawa Timur")
    })

    it("skips empty levels instead of leaving stray separators", () => {
        const geography = { village: "Tunjungan", district: null, regency: "Malang", province: null }

        expect(formatGeography(geography)).toBe("Tunjungan, Malang")
    })

    it("returns an empty string when geography is missing", () => {
        expect(formatGeography(null)).toBe("")
    })
})

describe("formatOutletLocation", () => {
    it("joins the street address with the region line", () => {
        expect(formatOutletLocation(outlet())).toBe("Jl. Merdeka No. 1, Tunjungan, Klojen, Malang, Jawa Timur")
    })

    it("falls back to the street address when geography is unavailable", () => {
        expect(formatOutletLocation(outlet({ geography: null }))).toBe("Jl. Merdeka No. 1")
    })

    it("falls back to the region line when the address is blank", () => {
        expect(formatOutletLocation(outlet({ address: "   " }))).toBe("Tunjungan, Klojen, Malang, Jawa Timur")
    })

    it("returns an empty string when the outlet is unresolved", () => {
        expect(formatOutletLocation(null)).toBe("")
    })
})
