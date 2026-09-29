import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { FormDialog } from "./form-dialog"

function renderDialog(overrides: Partial<React.ComponentProps<typeof FormDialog>> = {}) {
    const onClose = vi.fn()
    const onSubmit = vi.fn()

    render(
        <FormDialog
            title="Tambah variant"
            description="Isi nama dan harga variant."
            onClose={onClose}
            onSubmit={onSubmit}
            {...overrides}
        >
            <label htmlFor="variant-name">Nama</label>
            <input id="variant-name" />
        </FormDialog>
    )

    return { onClose, onSubmit }
}

describe("FormDialog", () => {
    it("closes on Batal", async () => {
        const user = userEvent.setup()
        const { onClose } = renderDialog()

        await user.click(screen.getByRole("button", { name: "Batal" }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("submits from a real submit button inside the form", async () => {
        const user = userEvent.setup()
        const { onSubmit } = renderDialog()

        const submit = screen.getByRole("button", { name: "Simpan" })

        // The footer sits outside the scrolling body, so the button only keeps
        // working if it is still a real `type="submit"` inside the form element
        // rather than one bound to a form by id.
        expect(submit).toHaveAttribute("type", "submit")
        expect(submit.closest("form")).not.toBeNull()

        await user.click(submit)

        expect(onSubmit).toHaveBeenCalledTimes(1)
    })

    it("keeps the submit button disabled and swaps in a spinner while saving", () => {
        renderDialog({ isPending: true })

        const submit = screen.getByRole("button", { name: /Menyimpan/ })

        expect(submit).toBeDisabled()
    })

    it("labels the submit button per the form", () => {
        renderDialog({ submitLabel: "Simpan variant" })

        expect(screen.getByRole("button", { name: "Simpan variant" })).toBeInTheDocument()
    })

    it("spells out the title and description for assistive technology", () => {
        renderDialog()

        expect(screen.getByRole("heading", { name: "Tambah variant" })).toBeInTheDocument()
        expect(screen.getByText("Isi nama dan harga variant.")).toBeInTheDocument()
    })

    it("offers an explicit close action only where a swipe is not available", () => {
        renderDialog()

        // Phones dismiss the sheet with the drag handle, so the X would be a
        // duplicate affordance there. It is hidden below `md` and shown from
        // `md` up, where a pointer cannot perform a swipe.
        const close = screen.getByRole("button", { name: "Tutup" })

        expect(close).toHaveClass("hidden", "md:inline-flex")
        expect(close).not.toHaveClass("inline-flex")
    })

    it("closes from the desktop close action", async () => {
        const user = userEvent.setup()
        const { onClose } = renderDialog()

        await user.click(screen.getByRole("button", { name: "Tutup" }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("renders inside a bottom sheet rather than a dialog", () => {
        renderDialog()

        expect(document.querySelector('[data-slot="bottom-sheet-content"]')).toBeInTheDocument()
        expect(document.querySelector('[data-slot="dialog-content"]')).not.toBeInTheDocument()
    })
})
