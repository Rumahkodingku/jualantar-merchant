import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { describe, expect, it, vi } from "vitest"

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }))

vi.mock("../services/auth.mutations", () => ({
    useRegisterMerchant: () => ({ mutate, isPending: false }),
}))

import { RegisterForm } from "./register-form"

function renderForm() {
    return render(
        <MemoryRouter>
            <RegisterForm />
        </MemoryRouter>
    )
}

describe("RegisterForm", () => {
    it("shows validation errors for an empty submission", async () => {
        const user = userEvent.setup()
        renderForm()

        await user.click(screen.getByRole("button", { name: /^daftar$/i }))

        expect(await screen.findByText("Nama lengkap wajib diisi.")).toBeInTheDocument()
        expect(screen.getByText("Email wajib diisi.")).toBeInTheDocument()
        expect(screen.getByText("Anda harus menyetujui syarat & ketentuan.")).toBeInTheDocument()
        expect(mutate).not.toHaveBeenCalled()
    })

    it("submits the registration values", async () => {
        const user = userEvent.setup()
        renderForm()

        await user.type(screen.getByLabelText("Nama lengkap"), "Merchant Owner")
        await user.type(screen.getByLabelText("Email"), "merchant@example.com")
        await user.type(screen.getByLabelText("Nomor telepon"), "081234567890")
        await user.type(screen.getByLabelText("Kata sandi"), "secret123")
        await user.type(screen.getByLabelText("Konfirmasi kata sandi"), "secret123")
        await user.click(screen.getByRole("checkbox"))
        await user.click(screen.getByRole("button", { name: /^daftar$/i }))

        expect(mutate).toHaveBeenCalledWith(
            expect.objectContaining({
                email: "merchant@example.com",
                terms_accepted: true,
            }),
            expect.objectContaining({ onSuccess: expect.any(Function) })
        )
    })
})
