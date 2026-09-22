import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { describe, expect, it, vi } from "vitest"

const fixtures = vi.hoisted(() => ({
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
        data: { data: [], meta: { current_page: 1, per_page: 1, total: 2, last_page: 1 } },
        isPending: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
    },
}))

vi.mock("~/modules/merchant-operations", () => ({
    SETTINGS_PATHS: {
        home: "/settings",
        outlets: "/settings/outlets",
        outletNew: "/settings/outlets/new",
    },
    merchantStatusPresentation: (status: string) => ({
        status,
        label: status === "active" ? "Aktif" : status === "suspended" ? "Ditangguhkan" : "Tidak Aktif",
        tone: status === "active" ? "positive" : status === "suspended" ? "negative" : "neutral",
    }),
    useOperationsSummary: () => fixtures.summary,
    useOperationalOutlets: () => fixtures.outlets,
}))

import { MerchantHome } from "./merchant-home"
import type { MerchantRegistration } from "~/modules/merchant-registration"

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

function renderHome(data: MerchantRegistration) {
    return render(
        <MemoryRouter>
            <MerchantHome registration={data} />
        </MemoryRouter>
    )
}

describe("MerchantHome", () => {
    it("renders the operational summary and shortcuts for an active merchant", () => {
        renderHome(registration())

        expect(screen.getByText("Toko Maju")).toBeInTheDocument()
        expect(screen.getByText("Aktif")).toBeInTheDocument()
        expect(screen.getByText("2 outlet")).toBeInTheDocument()
        expect(screen.getByText("Jalan pintas")).toBeInTheDocument()
        expect(screen.getByText("Pesanan")).toBeInTheDocument()
        expect(screen.queryByText("Akun merchant dijeda")).not.toBeInTheDocument()
    })

    it("shows the suspended banner but keeps the home content", () => {
        renderHome(registration({ merchant_status: "suspended" }))

        expect(screen.getByText("Akun merchant dijeda")).toBeInTheDocument()
        expect(screen.getByText("Jalan pintas")).toBeInTheDocument()
    })
})
