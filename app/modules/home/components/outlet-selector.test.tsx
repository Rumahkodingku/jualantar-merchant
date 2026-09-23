import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { describe, expect, it, vi } from "vitest"

import type { OperationalOutlet } from "~/modules/merchant-operations"

vi.mock("~/modules/settings", () => ({
    SETTINGS_PATHS: {
        home: "/settings",
        outlets: "/settings/outlets",
        outletNew: "/settings/outlets/new",
    },
}))

vi.mock("~/modules/merchant-operations", () => ({
    outletStatusLabel: (status: string) => (status === "active" ? "Aktif" : "Nonaktif"),
}))

import { OutletSelector } from "./outlet-selector"

function outlet(overrides: Partial<OperationalOutlet> = {}): OperationalOutlet {
    return {
        id: "o1",
        merchant_id: "m1",
        name: "Outlet 1",
        phone: null,
        email: null,
        address: "Jl. Merdeka No. 1",
        province_id: 1,
        regency_id: 1,
        district_id: 1,
        village_id: 1,
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
        ...overrides,
    }
}

const OUTLETS = [
    outlet({ id: "o1", name: "Outlet Pusat" }),
    outlet({ id: "o2", name: "Outlet Cabang", status: "inactive", address: "Jl. Sudirman No. 9" }),
]

function renderSelector(selectedId: string | null = null, onSelect: (id: string | null) => void = () => {}) {
    return render(
        <MemoryRouter>
            <OutletSelector
                outlets={OUTLETS}
                outletTotal={2}
                selectedId={selectedId}
                hasMore={false}
                isPending={false}
                isError={false}
                error={null}
                onRetry={() => {}}
                onSelect={onSelect}
            />
        </MemoryRouter>
    )
}

describe("OutletSelector", () => {
    it("shows all outlets as the default selection", () => {
        renderSelector()

        expect(screen.getByRole("button", { name: /Outlet terpilih: Semua Outlet \(2\)/ })).toBeInTheDocument()
    })

    it("expands the list and selects a specific outlet", async () => {
        const user = userEvent.setup()
        const onSelect = vi.fn()
        renderSelector(null, onSelect)

        await user.click(screen.getByRole("button", { name: /Outlet terpilih/ }))

        expect(screen.getByRole("listbox", { name: "Daftar outlet" })).toBeInTheDocument()
        expect(screen.getByRole("option", { name: /Outlet Cabang/ })).toBeInTheDocument()

        await user.click(screen.getByRole("option", { name: /Outlet Cabang/ }))

        expect(onSelect).toHaveBeenCalledWith("o2")
    })

    it("can return to all outlets from a selected outlet", async () => {
        const user = userEvent.setup()
        const onSelect = vi.fn()
        renderSelector("o1", onSelect)

        expect(screen.getByRole("button", { name: /Outlet terpilih: Outlet Pusat/ })).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: /Outlet terpilih/ }))
        await user.click(screen.getByRole("option", { name: /Semua Outlet \(2\)/ }))

        expect(onSelect).toHaveBeenCalledWith(null)
    })

    it("is keyboard operable", async () => {
        const user = userEvent.setup()
        const onSelect = vi.fn()
        renderSelector(null, onSelect)

        await user.tab()
        expect(screen.getByRole("button", { name: /Outlet terpilih/ })).toHaveFocus()

        await user.keyboard("{Enter}")
        expect(screen.getByRole("listbox", { name: "Daftar outlet" })).toBeInTheDocument()

        await user.keyboard("{Escape}")
        expect(screen.queryByRole("listbox", { name: "Daftar outlet" })).not.toBeInTheDocument()
    })
})
