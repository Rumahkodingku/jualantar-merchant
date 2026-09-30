import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { CategoryFormDialog } from "./category-form-dialog"
import type { CatalogCategory } from "../../types"

/**
 * The category form shares its sheet with the variant, modifier and modifier
 * group forms, so the assertions here are the ones that only hold if the swap to
 * `FormDialog` actually happened: that the content sits in a bottom sheet rather
 * than a centred dialog, and that the two modes lay out the same fields — a field
 * added to one and forgotten in the other would let a merchant type something the
 * other silently drops.
 */

const CATEGORY: CatalogCategory = {
    id: "c1",
    name: "Makanan",
    description: "Menu utama",
    status: "active",
    display_order: 0,
    created_at: null,
    updated_at: null,
}

function renderDialog(category?: CatalogCategory) {
    cleanup()

    const onClose = vi.fn()
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    render(
        <QueryClientProvider client={queryClient}>
            <CategoryFormDialog category={category} onClose={onClose} />
        </QueryClientProvider>
    )

    return { onClose }
}

function labels(): string[] {
    return Array.from(document.querySelectorAll("label"))
        .map((label) => label.textContent?.trim() ?? "")
        .filter((text) => text !== "")
        .sort()
}

beforeEach(() => {
    vi.clearAllMocks()
})

describe("the category form opens in a bottom sheet", () => {
    it("renders as a sheet rather than a centred dialog", () => {
        renderDialog()

        expect(document.querySelector('[data-slot="bottom-sheet-content"]')).toBeInTheDocument()
        expect(document.querySelector('[data-slot="dialog-content"]')).not.toBeInTheDocument()
    })

    it("says what the sheet is for", () => {
        renderDialog()

        expect(screen.getByRole("heading", { name: "Tambah kategori" })).toBeInTheDocument()
        expect(screen.getByText("Kelompokkan produk agar mudah dicari merchant.")).toBeInTheDocument()
    })

    it("titles the sheet for the mode it is in", () => {
        renderDialog(CATEGORY)

        expect(screen.getByRole("heading", { name: "Edit kategori" })).toBeInTheDocument()
    })

    it("closes from Batal", async () => {
        const user = userEvent.setup()
        const { onClose } = renderDialog()

        await user.click(screen.getByRole("button", { name: "Batal" }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })
})

describe("adding and editing a category offer the same fields", () => {
    it("offers the same name and description either way", () => {
        renderDialog()
        const expected = ["Deskripsi (opsional)", "Nama kategori"]

        expect(labels()).toEqual(expected)

        cleanup()

        renderDialog(CATEGORY)

        expect(labels()).toEqual(expected)
    })

    it("starts empty when a category is being added", () => {
        renderDialog()

        expect(screen.getByLabelText("Nama kategori")).toHaveValue("")
        expect(screen.getByLabelText("Deskripsi (opsional)")).toHaveValue("")
    })

    it("starts from the category being edited", () => {
        renderDialog(CATEGORY)

        expect(screen.getByLabelText("Nama kategori")).toHaveValue("Makanan")
        expect(screen.getByLabelText("Deskripsi (opsional)")).toHaveValue("Menu utama")
    })
})
