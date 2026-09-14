import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { mutate, state } = vi.hoisted(() => ({
    mutate: vi.fn(),
    state: { isPending: false, isSuccess: false, isError: false },
}))

vi.mock("../services/auth.mutations", () => ({
    useVerifyEmail: () => ({ mutate, ...state }),
}))

import { VerifyEmailPage } from "./verify-email-page"

function renderAt(entry: string) {
    return render(
        <MemoryRouter initialEntries={[entry]}>
            <VerifyEmailPage />
        </MemoryRouter>
    )
}

beforeEach(() => {
    mutate.mockClear()
    state.isPending = false
    state.isSuccess = false
    state.isError = false
})

describe("VerifyEmailPage", () => {
    it("shows a success state after verification", () => {
        state.isSuccess = true

        renderAt("/merchant/verify-email?id=user-1&hash=hash-1&expires=1&signature=sig")

        expect(screen.getByText("Email berhasil diverifikasi")).toBeInTheDocument()
        expect(mutate).toHaveBeenCalledWith({
            id: "user-1",
            hash: "hash-1",
            expires: "1",
            signature: "sig",
        })
    })

    it("shows a failure state when verification fails", () => {
        state.isError = true

        renderAt("/merchant/verify-email?id=user-1&hash=hash-1&expires=1&signature=sig")

        expect(screen.getByText("Verifikasi gagal")).toBeInTheDocument()
    })

    it("does not call the api when params are missing", () => {
        renderAt("/merchant/verify-email")

        expect(screen.getByText("Verifikasi gagal")).toBeInTheDocument()
        expect(mutate).not.toHaveBeenCalled()
    })
})
