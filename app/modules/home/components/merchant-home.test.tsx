import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { describe, expect, it, vi } from "vitest"

const fixtures: {
    summary: { data: unknown; isPending: boolean; isError: boolean; error: unknown; refetch: () => void }
    outlets: { data: unknown; isPending: boolean; isError: boolean; error: unknown; refetch: () => void }
} = vi.hoisted(() => ({
    summary: {
        data: {
            merchant: { id: "m1", business_name: "Toko Maju", status: "active" },
            operational: { status: "active" },
        },
        isPending: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
    },
    outlets: {
        data: { data: [] as unknown[], meta: { current_page: 1, per_page: 50, total: 0, last_page: 1 } },
        isPending: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
    },
}))

vi.mock("~/modules/settings", () => ({
    SETTINGS_PATHS: {
        home: "/settings",
        account: "/settings/account",
        notifications: "/settings/notifications",
        outlets: "/settings/outlets",
        outletNew: "/settings/outlets/new",
        help: "/settings/help",
    },
}))

vi.mock("~/modules/products", () => ({
    PRODUCTS_PATHS: { home: "/products", new: "/products/new" },
}))

vi.mock("~/modules/promotions", () => ({
    PROMOTIONS_PATHS: { home: "/promotions", new: "/promotions/new" },
}))

vi.mock("~/modules/merchant-operations", () => ({
    merchantStatusPresentation: (status: string) => ({
        status,
        label: status === "active" ? "Aktif" : status === "suspended" ? "Ditangguhkan" : "Tidak Aktif",
        tone: status === "active" ? "positive" : status === "suspended" ? "negative" : "neutral",
    }),
    outletStatusLabel: (status: string) => (status === "active" ? "Aktif" : "Nonaktif"),
    outletPath: (id: string) => `/settings/outlets/${id}`,
    outletHoursPath: (id: string) => `/settings/outlets/${id}/hours`,
    StatusBadge: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    useOperationsSummary: () => fixtures.summary,
    useOperationalOutlets: () => fixtures.outlets,
}))

import { MerchantHome } from "./merchant-home"
import type { MerchantRegistration } from "~/modules/merchant-registration"

function testOutlet(overrides: Record<string, unknown> = {}) {
    return {
        id: "o1",
        merchant_id: "m1",
        name: "Ayam Geprek Ganteng",
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

function registration(overrides: Partial<MerchantRegistration> = {}): MerchantRegistration {
    return {
        id: "m1",
        business_name: "Toko Maju",
        slug: "toko-maju",
        description: null,
        type: "individual",
        status: "approved",
        merchant_status: "active",
        logo: null,
        logo_url: null,
        service: null,
        identity: null,
        legal_entity: null,
        categories: [],
        outlets: [],
        documents: [],
        payout_accounts: [],
        created_at: null,
        updated_at: null,
        ...overrides,
    }
}

function renderHome(data: MerchantRegistration, initialEntries: string[] = ["/"]) {
    return render(
        <MemoryRouter initialEntries={initialEntries}>
            <MerchantHome registration={data} />
        </MemoryRouter>
    )
}

function resetFixtures() {
    fixtures.summary.isPending = false
    fixtures.summary.isError = false
    fixtures.summary.error = null
    fixtures.summary.data = {
        merchant: { id: "m1", business_name: "Toko Maju", status: "active" },
        operational: { status: "active" },
    }
    fixtures.outlets.isPending = false
    fixtures.outlets.isError = false
    fixtures.outlets.error = null
    fixtures.outlets.data = {
        data: [],
        meta: { current_page: 1, per_page: 50, total: 0, last_page: 1 },
    }
}

describe("MerchantHome", () => {
    it("renders the zero-outlet setup state", () => {
        resetFixtures()
        renderHome(registration())

        expect(screen.getByText("Belum ada outlet")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: /Tambah Outlet/ })).toHaveAttribute("href", "/settings/outlets/new")
        expect(screen.queryByText("Pesanan Hari Ini")).not.toBeInTheDocument()
    })

    it("renders the single-outlet dashboard", () => {
        resetFixtures()
        fixtures.outlets.data = {
            data: [testOutlet()],
            meta: { current_page: 1, per_page: 50, total: 1, last_page: 1 },
        }
        renderHome(registration())

        expect(screen.getByRole("heading", { name: /Toko Maju/ })).toBeInTheDocument()
        expect(screen.getByText("Ayam Geprek Ganteng")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: /Masuk ke Operasional/ })).toHaveAttribute("href", "/orders")
        expect(screen.getByText("Pesanan Hari Ini")).toBeInTheDocument()
        expect(screen.getByText("Ringkasan Hari Ini")).toBeInTheDocument()
        expect(screen.getByText("Ringkasan 7 Hari Terakhir")).toBeInTheDocument()
        expect(screen.getByText("Menu Utama")).toBeInTheDocument()
        expect(screen.getByText("Pesanan Terbaru")).toBeInTheDocument()
        expect(screen.getByText("Produk Terlaris Hari Ini")).toBeInTheDocument()
        expect(screen.getByText("Aktivitas Terbaru")).toBeInTheDocument()
        expect(screen.queryByText("Performa Outlet")).not.toBeInTheDocument()
    })

    it("renders the multi-outlet dashboard with Semua Outlet by default", () => {
        resetFixtures()
        fixtures.outlets.data = {
            data: [testOutlet(), testOutlet({ id: "o2", name: "Cabang Sudirman" })],
            meta: { current_page: 1, per_page: 50, total: 2, last_page: 1 },
        }
        renderHome(registration())

        expect(screen.getByRole("button", { name: /Outlet terpilih: Semua Outlet \(2\)/ })).toBeInTheDocument()
        expect(screen.getByText("Ringkasan gabungan seluruh outlet Anda")).toBeInTheDocument()
        expect(screen.getByText("Performa Outlet")).toBeInTheDocument()
        expect(screen.getByText("Cabang Sudirman")).toBeInTheDocument()
        expect(screen.queryByRole("link", { name: /Masuk ke Operasional/ })).not.toBeInTheDocument()
    })

    it("renders the selected outlet context from the URL param", () => {
        resetFixtures()
        fixtures.outlets.data = {
            data: [testOutlet(), testOutlet({ id: "o2", name: "Cabang Sudirman" })],
            meta: { current_page: 1, per_page: 50, total: 2, last_page: 1 },
        }
        renderHome(registration(), ["/?outlet=o2"])

        expect(screen.getByRole("button", { name: /Outlet terpilih: Cabang Sudirman/ })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: /Masuk ke Operasional Cabang Sudirman/ })).toBeInTheDocument()
        expect(screen.queryByText("Performa Outlet")).not.toBeInTheDocument()
    })

    it("shows the suspended banner but keeps the home content", () => {
        resetFixtures()
        fixtures.outlets.data = {
            data: [testOutlet()],
            meta: { current_page: 1, per_page: 50, total: 1, last_page: 1 },
        }
        renderHome(registration({ merchant_status: "suspended" }))

        expect(screen.getByText("Akun merchant dijeda")).toBeInTheDocument()
        expect(screen.getByText("Merchant ditangguhkan")).toBeInTheDocument()
        expect(screen.getByText("Pesanan Hari Ini")).toBeInTheDocument()
    })

    it("shows the inactive outlet state", () => {
        resetFixtures()
        fixtures.outlets.data = {
            data: [testOutlet({ status: "inactive" })],
            meta: { current_page: 1, per_page: 50, total: 1, last_page: 1 },
        }
        renderHome(registration())

        expect(screen.getByText("Outlet sedang tidak aktif")).toBeInTheDocument()
    })

    it("shows a skeleton while loading and an error state when both queries fail", () => {
        resetFixtures()
        fixtures.summary.isPending = true
        fixtures.outlets.isPending = true
        const { unmount } = renderHome(registration())

        expect(screen.getByLabelText("Memuat beranda")).toBeInTheDocument()
        unmount()

        resetFixtures()
        fixtures.summary.isPending = false
        fixtures.summary.isError = true
        fixtures.summary.error = new Error("down")
        fixtures.outlets.isError = true
        fixtures.outlets.error = new Error("down")
        renderHome(registration())

        expect(screen.getByText("Gagal memuat beranda")).toBeInTheDocument()
    })
})
