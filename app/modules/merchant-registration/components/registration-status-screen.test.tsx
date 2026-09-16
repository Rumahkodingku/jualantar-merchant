import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { describe, expect, it, vi } from "vitest"

vi.mock("~/modules/auth", () => ({
    useLogout: () => ({ mutate: vi.fn(), isPending: false }),
}))

import { RegistrationStatusScreen } from "./registration-status-screen"
import type { MerchantRegistration } from "../types/merchant-registration.types"

function registration(overrides: Partial<MerchantRegistration> = {}): MerchantRegistration {
    return {
        id: "m1",
        business_name: "Warung",
        slug: "warung",
        description: null,
        type: "individual",
        status: "draft",
        merchant_status: "inactive",
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

function renderScreen(data: MerchantRegistration) {
    return render(
        <MemoryRouter>
            <RegistrationStatusScreen registration={data} />
        </MemoryRouter>
    )
}

describe("RegistrationStatusScreen", () => {
    it("shows the pending message", () => {
        renderScreen(registration({ status: "pending" }))

        expect(screen.getByText("Pendaftaran sedang ditinjau")).toBeInTheDocument()
    })

    it("shows the in-review message", () => {
        renderScreen(registration({ status: "in_review" }))

        expect(screen.getByText("Pendaftaran sedang ditinjau")).toBeInTheDocument()
    })

    it("shows the approved state", () => {
        renderScreen(registration({ status: "approved", merchant_status: "active" }))

        expect(screen.getByText("Usaha Anda sudah aktif")).toBeInTheDocument()
    })

    it("shows the suspended state", () => {
        renderScreen(registration({ status: "approved", merchant_status: "suspended" }))

        expect(screen.getByText("Akun merchant dijeda")).toBeInTheDocument()
    })

    it("shows the rejection reason when available", () => {
        renderScreen(
            registration({
                status: "rejected",
                rejection_reason: "Foto KTP kurang jelas.",
            })
        )

        expect(screen.getByText("Pendaftaran belum disetujui")).toBeInTheDocument()
        expect(screen.getByText("Foto KTP kurang jelas.")).toBeInTheDocument()
    })
})
