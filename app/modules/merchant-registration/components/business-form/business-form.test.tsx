import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

const { mutate, goNext } = vi.hoisted(() => ({
    mutate: vi.fn(),
    goNext: vi.fn(),
}))

vi.mock("./registration-context", () => ({
    useRegistrationContext: () => ({
        registration: {
            business_name: null,
            type: null,
            description: null,
        },
        navigation: {
            goNext,
            goBack: vi.fn(),
            isFirst: true,
        },
    }),
}))

vi.mock("../services/merchant-registration.mutations", () => ({
    useUpdateBusinessProfile: () => ({ mutate, isPending: false }),
}))

import { BusinessForm } from "."

describe("BusinessForm", () => {
    it("blocks submission when the business name is empty", async () => {
        const user = userEvent.setup()
        render(<BusinessForm />)

        await user.click(screen.getByRole("button", { name: /simpan & lanjut/i }))

        expect(await screen.findByText("Nama usaha wajib diisi.")).toBeInTheDocument()
        expect(mutate).not.toHaveBeenCalled()
    })

    it("submits the profile values", async () => {
        const user = userEvent.setup()
        render(<BusinessForm />)

        await user.type(screen.getByLabelText("Nama usaha"), "Warung Sari")
        await user.click(screen.getByRole("radio", { name: /^badan usaha/i }))
        await user.click(screen.getByRole("button", { name: /simpan & lanjut/i }))

        expect(mutate).toHaveBeenCalledWith(
            expect.objectContaining({
                business_name: "Warung Sari",
                type: "company",
            }),
            expect.objectContaining({ onSuccess: expect.any(Function) })
        )
    })
})
