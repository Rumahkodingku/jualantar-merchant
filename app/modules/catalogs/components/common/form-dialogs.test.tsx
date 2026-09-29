import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ModifierFormDialog } from "../modifiers/modifier-form-dialog"
import { ModifierGroupFormDialog } from "../modifiers/modifier-group-form-dialog"
import { VariantFormDialog } from "../variants/variant-form-dialog"
import type { FormMode } from "../variants/variant-form-dialog"

/**
 * The wizard stages a row and the edit screen saves one, through the same
 * dialog. That is only safe while both modes lay out the same fields — a field
 * added to one and forgotten in the other would let a merchant type something
 * the wizard silently drops.
 *
 * These assertions run the same form in both modes and compare what is on
 * screen, so the two can never drift apart unnoticed.
 */
function renderWithClient(ui: React.ReactNode) {
    // Dialogs portal out of the render container, and each test renders the
    // same form twice, so the tree is cleared in between to keep the two
    // label sets from overlapping.
    cleanup()

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })

    render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)

    // Read from the document, not the render container: the dialog body is
    // portalled onto document.body.
    //
    // Inputs carry a `<label>`; the toggle rows name themselves with a `<p>`
    // above the switch. Both count as "a field the merchant can fill in".
    const labelled = Array.from(document.querySelectorAll("label")).map((label) => label.textContent?.trim() ?? "")
    const toggles = Array.from(document.querySelectorAll('[data-slot="switch"]'))
        .map((toggle) => toggle.parentElement?.querySelector("p")?.textContent?.trim() ?? "")
        .filter((text) => text !== "")

    return [...labelled, ...toggles].filter((text) => text !== "").sort()
}

function renderVariant(mode: FormMode) {
    return renderWithClient(
        <VariantFormDialog mode={mode} productId="p1" onClose={() => undefined} onSubmit={() => undefined} />
    )
}

function renderModifier(mode: FormMode) {
    return renderWithClient(<ModifierFormDialog mode={mode} productId="p1" groupId="g1" onClose={() => undefined} />)
}

function renderModifierGroup(mode: FormMode) {
    return renderWithClient(<ModifierGroupFormDialog mode={mode} productId="p1" onClose={() => undefined} />)
}

describe("form dialogs render the same fields in both modes", () => {
    it("variant: both modes offer name, sku, price and default", () => {
        const draft = renderVariant("draft")
        const server = renderVariant("server")

        // Server mode adds exactly one field — the status toggle below — and
        // otherwise offers the same form the wizard does.
        expect(draft).toEqual(["Harga (Rp)", "Nama", "SKU (opsional)", "Variant utama"])
        expect(server.filter((field) => field !== "Status aktif")).toEqual(draft)
        expect(server).toEqual([...draft, "Status aktif"].sort())
    })

    it("modifier: both modes offer name, description, price and default", () => {
        expect(renderModifier("server")).toEqual(renderModifier("draft"))
        expect(renderModifier("server")).toEqual([
            "Deskripsi (opsional)",
            "Dipilih secara default",
            "Harga tambahan (Rp)",
            "Nama",
        ])
    })

    it("modifier group: both modes offer the same fields", () => {
        expect(renderModifierGroup("server")).toEqual(renderModifierGroup("draft"))
        expect(renderModifierGroup("server")).toEqual([
            "Deskripsi (opsional)",
            "Nama group",
            "Tipe seleksi",
            "Wajib dipilih",
        ])
    })
})

describe("the status toggle belongs to the server only", () => {
    it("is offered when saving a saved variant", () => {
        renderVariant("server")

        expect(screen.getByText("Status aktif")).toBeInTheDocument()
    })

    it("is not offered for a staged variant, whose status is decided on create", () => {
        renderVariant("draft")

        expect(screen.queryByText("Status aktif")).not.toBeInTheDocument()
    })
})

describe("a draft form never waits on the network", () => {
    it("shows a plain submit, with no pending state to enter", () => {
        renderVariant("draft")

        expect(screen.getByRole("button", { name: "Simpan" })).toBeInTheDocument()
        expect(screen.queryByText("Menyimpan…")).not.toBeInTheDocument()
    })
})
