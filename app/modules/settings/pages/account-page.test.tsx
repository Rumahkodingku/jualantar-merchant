import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

const auth = vi.hoisted(() => ({
    logout: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
}))

vi.mock("~/modules/auth", () => ({
    useSession: () => ({ user: { email: "owner@example.com", roles: ["owner"] } }),
    useLogout: () => ({
        mutate: auth.logout,
        isPending: auth.isPending,
        isError: auth.isError,
        error: auth.error,
    }),
}))

import { AccountPage } from "./account-page"

beforeEach(() => {
    auth.logout.mockReset()
    auth.isPending = false
    auth.isError = false
    auth.error = null
})

describe("AccountPage", () => {
    it("shows account details without treating the email as a heading", () => {
        render(
            <MemoryRouter initialEntries={["/settings/account"]}>
                <AccountPage />
            </MemoryRouter>
        )

        expect(screen.getByRole("heading", { name: "Akun" })).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Detail akun" })).toBeInTheDocument()
        expect(screen.queryByRole("heading", { name: "owner@example.com" })).not.toBeInTheDocument()
        expect(screen.getAllByText("owner@example.com")).toHaveLength(2)
    })

    it("confirms before logging out", async () => {
        const user = userEvent.setup()

        render(
            <MemoryRouter initialEntries={["/settings/account"]}>
                <AccountPage />
            </MemoryRouter>
        )

        await user.click(screen.getByRole("button", { name: "Keluar dari akun" }))
        expect(screen.getByRole("heading", { name: "Keluar dari akun?" })).toBeInTheDocument()
        expect(auth.logout).not.toHaveBeenCalled()

        await user.click(screen.getByRole("button", { name: "Ya, keluar" }))
        expect(auth.logout).toHaveBeenCalledOnce()
    })
})
