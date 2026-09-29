import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ModifierFormDialog } from "../modifiers/modifier-form-dialog"
import { ModifierGroupFormDialog } from "../modifiers/modifier-group-form-dialog"
import { VariantFormDialog } from "../variants/variant-form-dialog"
import type { FormMode } from "../variants/variant-form-dialog"

/**
 * The create wizard stages a row and the edit wizard saves one, through the same
 * dialog. That is only safe while the two lay out the same fields — a field added
 * to one and forgotten in the other would let a merchant type something the other
 * silently drops.
 *
 * These assertions run the same form in every mode and compare what is on screen.
 * The only field allowed to differ is the status toggle, and it is allowed to
 * differ for a reason: a product that does not exist yet has no status to give a
 * row, while a product that is already there does.
 */
function renderWithClient(ui: React.ReactNode) {
    // Dialogs portal out of the render container, and each test renders the
    // same form more than once, so the tree is cleared in between to keep the
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

const STATUS_FIELD = "Status aktif"

describe("every mode offers the same fields apart from the status toggle", () => {
    it("variant: draft, edit and server agree on name, sku, price and default", () => {
        const draft = renderVariant("draft")
        const edit = renderVariant("edit")
        const server = renderVariant("server")

        expect(draft).toEqual(["Harga (Rp)", "Nama", "SKU (opsional)", "Variant utama"])

        // The status toggle is the one field that may differ, and it does so
        // deliberately: the create wizard has no product to give a status to.
        for (const fields of [edit, server]) {
            expect(fields.filter((field) => field !== STATUS_FIELD)).toEqual(draft)
            expect(fields).toEqual([...draft, STATUS_FIELD].sort())
        }
    })

    it("modifier: draft, edit and server agree on name, description, price and default", () => {
        const draft = renderModifier("draft")
        const edit = renderModifier("edit")
        const server = renderModifier("server")

        expect(draft).toEqual(["Deskripsi (opsional)", "Dipilih secara default", "Harga tambahan (Rp)", "Nama"])

        for (const fields of [edit, server]) {
            expect(fields.filter((field) => field !== STATUS_FIELD)).toEqual(draft)
            expect(fields).toEqual([...draft, STATUS_FIELD].sort())
        }
    })

    it("modifier group: draft, edit and server agree on name, description, selection and required", () => {
        const draft = renderModifierGroup("draft")
        const edit = renderModifierGroup("edit")
        const server = renderModifierGroup("server")

        expect(draft).toEqual(["Deskripsi (opsional)", "Nama group", "Tipe seleksi", "Wajib dipilih"])

        for (const fields of [edit, server]) {
            expect(fields.filter((field) => field !== STATUS_FIELD)).toEqual(draft)
            expect(fields).toEqual([...draft, STATUS_FIELD].sort())
        }
    })
})

describe("the status toggle is offered wherever a status exists to change", () => {
    it("is offered when saving a saved variant", () => {
        renderVariant("server")

        expect(screen.getByText(STATUS_FIELD)).toBeInTheDocument()
    })

    it("is offered when editing a variant of a product that already exists", () => {
        renderVariant("edit")

        expect(screen.getByText(STATUS_FIELD)).toBeInTheDocument()
    })

    it("is not offered for a staged variant, whose status is decided on create", () => {
        renderVariant("draft")

        expect(screen.queryByText(STATUS_FIELD)).not.toBeInTheDocument()
    })
})

describe("a staged form never waits on the network", () => {
    it("shows a plain submit, with no pending state to enter", () => {
        renderVariant("draft")

        expect(screen.getByRole("button", { name: "Simpan" })).toBeInTheDocument()
        expect(screen.queryByText("Menyimpan…")).not.toBeInTheDocument()
    })

    it("is equally true of a row being staged for an edit", () => {
        renderVariant("edit")

        expect(screen.getByRole("button", { name: "Simpan" })).toBeInTheDocument()
        expect(screen.queryByText("Menyimpan…")).not.toBeInTheDocument()
    })
})
