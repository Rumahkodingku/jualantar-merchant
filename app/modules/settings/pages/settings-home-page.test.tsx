import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

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
    authorization: {
        canManageMerchant: true,
        canOpenOutlets: true,
    },
}))

vi.mock("~/modules/merchant-operations", async (importOriginal) => ({
    ...(await importOriginal<typeof import("~/modules/merchant-operations")>()),
    useOperationsSummary: () => fixtures.summary,
    useOperationalProfile: () => fixtures.profile,
    useOperationalOutlets: () => fixtures.outlets,
}))

vi.mock("~/modules/authorization", () => ({
    CAP: { view: "merchant.operations.view", outletsCreate: "merchant.operations.outlets.create" },
    canViewOutletList: () => fixtures.authorization.canOpenOutlets,
    useAuthorization: () => ({
        user: null,
        isOwner: true,
        can: () => fixtures.authorization.canManageMerchant,
    }),
}))

import { SettingsHomePage } from "./settings-home-page"

function renderHome() {
    return render(
        <MemoryRouter initialEntries={["/settings"]}>
            <SettingsHomePage />
        </MemoryRouter>
    )
}

beforeEach(() => {
    fixtures.summary.isPending = false
    fixtures.summary.isError = false
    fixtures.profile.isPending = false
    fixtures.profile.isError = false
    fixtures.outlets.isPending = false
    fixtures.outlets.isError = false
    fixtures.authorization.canManageMerchant = true
    fixtures.authorization.canOpenOutlets = true
})

describe("SettingsHomePage", () => {
    it("renders the page title, business identity, and all sections", () => {
        renderHome()

        expect(screen.getByRole("heading", { name: "Pengaturan" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Toko Maju" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Usaha" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Keuangan & legal" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Preferensi aplikasi" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Akun & keamanan" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Bantuan" })).toBeInTheDocument()

        expect(screen.getByRole("link", { name: /Profil usaha/ })).toHaveAttribute("href", "/settings/profile")
        expect(screen.getByRole("link", { name: /Status usaha/ })).toHaveAttribute("href", "/settings/status")
        expect(screen.getByRole("link", { name: /Outlet/ })).toHaveAttribute("href", "/settings/outlets")
        expect(screen.getByRole("link", { name: /Tampilan/ })).toHaveAttribute("href", "/settings/appearance")
        expect(screen.getByRole("link", { name: /Notifikasi perangkat/ })).toHaveAttribute(
            "href",
            "/settings/notifications"
        )
        expect(screen.getByRole("link", { name: /Akun/ })).toHaveAttribute("href", "/settings/account")
        expect(screen.getByRole("link", { name: /Bantuan & dukungan/ })).toHaveAttribute("href", "/settings/help")
        expect(screen.getByRole("link", { name: /Tentang aplikasi/ })).toHaveAttribute("href", "/settings/about")
    })

    it("shows the settings error when one required query fails", () => {
        fixtures.summary.isError = true
        renderHome()

        expect(screen.getByText("Gagal memuat pengaturan")).toBeInTheDocument()
    })

    it("keeps the page in loading state while either required query is pending", () => {
        fixtures.profile.isPending = true
        renderHome()

        expect(screen.queryByRole("heading", { name: "Toko Maju" })).not.toBeInTheDocument()
    })

    it("omits the business section when the user has no related access", () => {
        fixtures.authorization.canManageMerchant = false
        fixtures.authorization.canOpenOutlets = false
        renderHome()

        expect(screen.queryByRole("heading", { name: "Usaha" })).not.toBeInTheDocument()
    })

    it("marks not-yet-available menus as disabled with a coming-soon badge", () => {
        renderHome()

        expect(screen.getAllByText("Segera hadir")).toHaveLength(4)

        expect(screen.queryByRole("link", { name: /Rekening pencairan/ })).not.toBeInTheDocument()
        expect(screen.queryByRole("link", { name: /Dokumen & verifikasi/ })).not.toBeInTheDocument()
        expect(screen.queryByRole("link", { name: /Ubah kata sandi/ })).not.toBeInTheDocument()
        expect(screen.getByText("Rekening pencairan")).toBeInTheDocument()
        expect(screen.getByText("Dokumen & verifikasi")).toBeInTheDocument()
        expect(screen.getByText("Ubah kata sandi")).toBeInTheDocument()
    })

    it("does not link to the removed outlet shortcut pages", () => {
        renderHome()

        expect(screen.queryByText("Jam Operasional")).not.toBeInTheDocument()
        expect(screen.queryByText("Karyawan")).not.toBeInTheDocument()
        expect(screen.queryByText("Area Layanan")).not.toBeInTheDocument()
        expect(screen.queryByText("Status Operasional")).not.toBeInTheDocument()
    })
})
