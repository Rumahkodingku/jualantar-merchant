import { describe, expect, it } from "vitest"

import type { OperationalOutlet } from "~/modules/merchant-operations"

import { outletPhotoUrl } from "./outlet-photo"

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

describe("outletPhotoUrl", () => {
    it("returns the first photo url", () => {
        const photos_url = ["https://cdn.test/a.jpg", "https://cdn.test/b.jpg"]

        expect(outletPhotoUrl(outlet({ photos_url }))).toBe("https://cdn.test/a.jpg")
    })

    it("skips leading null entries instead of giving up on the first slot", () => {
        const photos_url = [null, "https://cdn.test/b.jpg"]

        expect(outletPhotoUrl(outlet({ photos_url }))).toBe("https://cdn.test/b.jpg")
    })

    it("skips empty strings", () => {
        const photos_url = ["", "https://cdn.test/b.jpg"]

        expect(outletPhotoUrl(outlet({ photos_url }))).toBe("https://cdn.test/b.jpg")
    })

    it("returns null when every entry is unusable", () => {
        expect(outletPhotoUrl(outlet({ photos_url: [null, ""] }))).toBeNull()
    })

    it("returns null when the outlet has no photos", () => {
        expect(outletPhotoUrl(outlet())).toBeNull()
    })

    it("returns null when the outlet is unresolved", () => {
        expect(outletPhotoUrl(null)).toBeNull()
        expect(outletPhotoUrl(undefined)).toBeNull()
    })
})
