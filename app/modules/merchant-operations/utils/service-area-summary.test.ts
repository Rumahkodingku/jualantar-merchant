import { describe, expect, it } from "vitest"

import { outletServiceAreaSummary, serviceAreaSummary } from "./service-area-summary"
import type { OperationalOutlet } from "../types/merchant-operations.types"

function outlet(overrides: Partial<OperationalOutlet> = {}): OperationalOutlet {
    return {
        id: "o1",
        merchant_id: "m1",
        name: "Outlet Utama",
        phone: null,
        email: null,
        address: "Jl. Test",
        province_id: 61,
        regency_id: 6106,
        district_id: 610601,
        village_id: 6106012001,
        postal_code: "78711",
        latitude: 0.84,
        longitude: 112.93,
        service_area_type: "radius",
        service_radius_km: "10.00",
        operating_hours: null,
        photos: [],
        photos_url: [],
        status: "active",
        geography: {
            village: "Desa Maju",
            district: "Kecamatan Seberang",
            regency: "Kapuas Hulu",
            province: "Kalimantan Barat",
        },
        created_at: null,
        updated_at: null,
        ...overrides,
    }
}

describe("outletServiceAreaSummary", () => {
    it("formats a radius from the outlet decimals", () => {
        expect(outletServiceAreaSummary(outlet())).toBe("Radius 10 km")
    })

    it("uses the outlet region label for regional areas", () => {
        expect(outletServiceAreaSummary(outlet({ service_area_type: "regency" }))).toBe("Kabupaten/Kota Kapuas Hulu")
    })

    it("falls back to the level label when the region name is unknown", () => {
        expect(outletServiceAreaSummary(outlet({ service_area_type: "village", geography: null }))).toBe(
            "Desa/Kelurahan"
        )
    })
})

describe("serviceAreaSummary", () => {
    it("prefers the payload returned by the service-area endpoint", () => {
        expect(serviceAreaSummary({ type: "radius", radius_km: "7.50" }, outlet())).toBe("Radius 7,5 km")
        expect(serviceAreaSummary({ type: "district", district_id: 610601 }, outlet())).toBe(
            "Kecamatan Kecamatan Seberang"
        )
    })

    it("falls back to the outlet when no service area is loaded", () => {
        expect(serviceAreaSummary(null, outlet())).toBe("Radius 10 km")
    })
})
