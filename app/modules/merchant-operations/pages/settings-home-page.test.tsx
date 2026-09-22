import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { describe, expect, it, vi } from "vitest"

const fixtures = vi.hoisted(() => ({
    summary: {
        data: { merchant: { business_name: "Toko Maju", status: "active" } },
        isPending: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
    },
    profile: {
        data: { business_name: "Toko Maju", status: "active", logo_url: null },
        isPending: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
    },
    outlets: {
        data: { data: [], meta: { total: 2 } },
        isPending: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
    },
}))

vi.mock("../services/merchant-operations.queries", () => ({
    useOperationsSummary: () => fixtures.summary,
    useOperationalProfile: () => fixtures.profile,
    useOperationalOutlets: () => fixtures.outlets,
}))

import { SettingsHomePage } from "./settings-home-page"

function renderHome() {
    return render(
        <MemoryRouter initialEntries={["/settings"]}>
            <SettingsHomePage />
        </MemoryRouter>
    )
}

describe("SettingsHomePage", () => {
    it("renders the page title, merchant identity, and the restructured sections", () => {
        renderHome()

        expect(screen.getByRole("heading", { name: "Pengaturan" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Toko Maju" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Merchant" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Akun" })).toBeInTheDocument()

        expect(screen.getByRole("link", { name: /Profil merchant/ })).toHaveAttribute("href", "/settings/profile")
        expect(screen.getByRole("link", { name: /Status merchant/ })).toHaveAttribute("href", "/settings/status")
        expect(screen.getByRole("link", { name: /Outlet/ })).toHaveAttribute("href", "/settings/outlets")
        expect(screen.getByRole("link", { name: /Tampilan/ })).toHaveAttribute("href", "/settings/appearance")
        expect(screen.getByRole("link", { name: /Akun & keluar/ })).toHaveAttribute("href", "/settings/account")
    })

    it("does not link to the removed outlet shortcut pages", () => {
        renderHome()

        expect(screen.queryByText("Jam Operasional")).not.toBeInTheDocument()
        expect(screen.queryByText("Karyawan")).not.toBeInTheDocument()
        expect(screen.queryByText("Area Layanan")).not.toBeInTheDocument()
        expect(screen.queryByText("Status Operasional")).not.toBeInTheDocument()
    })
})
