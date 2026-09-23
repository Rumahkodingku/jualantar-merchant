import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { describe, expect, it } from "vitest"

import type { OperationalOutlet } from "../../types/merchant-operations.types"
import { OutletSectionNav } from "./outlet-section-nav"

const outlet: OperationalOutlet = {
    id: "A",
    merchant_id: "m1",
    name: "Outlet A",
    phone: null,
    email: null,
    address: "Jl. Test",
    province_id: 1,
    regency_id: 2,
    district_id: 3,
    village_id: 4,
    postal_code: "12345",
    latitude: 0,
    longitude: 0,
    service_area_type: "radius",
    service_radius_km: 5,
    operating_hours: null,
    photos: [],
    photos_url: [],
    status: "active",
    geography: null,
    created_at: null,
    updated_at: null,
}

type Flags = {
    canViewHours: boolean
    canViewServiceArea: boolean
    canViewEmployees: boolean
    canViewAvailability: boolean
}

function renderNav(flags: Flags) {
    return render(
        <MemoryRouter>
            <OutletSectionNav outlet={outlet} {...flags} />
        </MemoryRouter>
    )
}

const ALL_TRUE: Flags = {
    canViewHours: true,
    canViewServiceArea: true,
    canViewEmployees: true,
    canViewAvailability: true,
}

describe("OutletSectionNav", () => {
    it("shows every section a manager can view", () => {
        renderNav(ALL_TRUE)

        expect(screen.getByRole("link", { name: /Status Operasional/ })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: /Jam Operasional/ })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: /Area Layanan/ })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: /Karyawan/ })).toBeInTheDocument()
    })

    it("hides sections the user cannot view", () => {
        renderNav({ ...ALL_TRUE, canViewEmployees: false })

        expect(screen.queryByRole("link", { name: /Karyawan/ })).not.toBeInTheDocument()
        expect(screen.getByRole("link", { name: /Jam Operasional/ })).toBeInTheDocument()
    })
})
