import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { describe, expect, it, vi } from "vitest"

const { reopenMutate } = vi.hoisted(() => ({ reopenMutate: vi.fn() }))

vi.mock("~/modules/auth", () => ({
    useLogout: () => ({ mutate: vi.fn(), isPending: false }),
}))

vi.mock("../services/merchant-registration.mutations", () => ({
    useReopenRegistration: () => ({ mutate: reopenMutate, isPending: false }),
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

    it("shows the rejection reason when available", () => {
        renderScreen(
            registration({
                status: "rejected",
                rejection_reason: "Foto KTP kurang jelas.",
            })
        )

        expect(screen.getByText("Pendaftaran perlu diperbaiki")).toBeInTheDocument()
        expect(screen.getByText("Foto KTP kurang jelas.")).toBeInTheDocument()
    })

    it("shows the active state", () => {
        renderScreen(registration({ status: "active" }))

        expect(screen.getByText("Usaha Anda sudah aktif")).toBeInTheDocument()
    })

    it("lets a rejected merchant reopen the registration", async () => {
        const user = userEvent.setup()
        renderScreen(
            registration({
                status: "rejected",
                rejection_stage: "identity",
                rejection_reason: "Foto KTP kurang jelas.",
            })
        )

        await user.click(screen.getByRole("button", { name: /perbaiki & kirim ulang/i }))

        expect(reopenMutate).toHaveBeenCalledWith(
            undefined,
            expect.objectContaining({ onSuccess: expect.any(Function) })
        )
    })
})
