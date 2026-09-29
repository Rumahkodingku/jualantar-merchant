import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { describe, expect, it, vi } from "vitest"

import { ProductFilters } from "./product-filters"
import type { CatalogCategory } from "../../types"

const CATEGORIES: CatalogCategory[] = [
    {
        id: "c1",
        name: "Makanan",
        description: null,
        status: "active",
        display_order: 0,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
    },
]

function renderFilters(overrides: Partial<React.ComponentProps<typeof ProductFilters>> = {}) {
    const onChange = vi.fn()
    const onReset = vi.fn()
    const onToggleReorder = vi.fn()

    render(
        <MemoryRouter>
            <ProductFilters
                values={{ search: "", category_id: "", status: "", product_type: "" }}
                categories={CATEGORIES}
                count={3}
                onChange={onChange}
                onReset={onReset}
                reorderMode={false}
                canReorder
                onToggleReorder={onToggleReorder}
                {...overrides}
            />
        </MemoryRouter>
    )

    return { onChange, onReset, onToggleReorder }
}

describe("ProductFilters", () => {
    it("reports the selected status chip", async () => {
        const user = userEvent.setup()
        const { onChange } = renderFilters()

        await user.click(screen.getByRole("button", { name: "Aktif" }))

        expect(onChange).toHaveBeenCalledWith({ status: "active" })
    })

    it("marks the active status chip as pressed", () => {
        renderFilters({ values: { search: "", category_id: "", status: "inactive", product_type: "" } })

        expect(screen.getByRole("button", { name: "Nonaktif" })).toHaveAttribute("aria-pressed", "true")
        expect(screen.getByRole("button", { name: "Aktif" })).toHaveAttribute("aria-pressed", "false")
    })

    it("forwards search input changes", async () => {
        const user = userEvent.setup()
        const { onChange } = renderFilters()

        await user.type(screen.getByLabelText("Cari produk"), "geprek")

        expect(onChange).toHaveBeenCalledWith({ search: "g" })
    })

    it("clears the search when the clear action is used", async () => {
        const user = userEvent.setup()
        const { onChange } = renderFilters({
            values: { search: "geprek", category_id: "", status: "", product_type: "" },
        })

        await user.click(screen.getByRole("button", { name: "Hapus pencarian" }))

        expect(onChange).toHaveBeenCalledWith({ search: "" })
    })

    it("toggles reorder mode", async () => {
        const user = userEvent.setup()
        const { onToggleReorder } = renderFilters()

        await user.click(screen.getByRole("button", { name: "Urutkan" }))

        expect(onToggleReorder).toHaveBeenCalledTimes(1)
    })

    it("keeps the filter fields behind the sheet until it is opened", () => {
        renderFilters()

        expect(screen.queryByLabelText("Kategori")).not.toBeInTheDocument()
        expect(screen.queryByLabelText("Tipe produk")).not.toBeInTheDocument()
    })

    it("reveals the filter fields once the sheet opens", async () => {
        const user = userEvent.setup()
        renderFilters()

        await user.click(screen.getByRole("button", { name: "Filter produk" }))

        expect(await screen.findByLabelText("Kategori")).toBeInTheDocument()
        expect(screen.getByLabelText("Tipe produk")).toBeInTheDocument()
    })

    it("closes the sheet when Terapkan is pressed", async () => {
        const user = userEvent.setup()
        renderFilters()

        await user.click(screen.getByRole("button", { name: "Filter produk" }))
        await screen.findByLabelText("Kategori")

        await user.click(screen.getByRole("button", { name: "Terapkan" }))

        await waitFor(() => {
            expect(screen.queryByLabelText("Kategori")).not.toBeInTheDocument()
        })
    })

    it("resets the filters without closing the sheet", async () => {
        const user = userEvent.setup()
        const { onReset } = renderFilters()

        await user.click(screen.getByRole("button", { name: "Filter produk" }))
        await screen.findByLabelText("Kategori")

        await user.click(screen.getByRole("button", { name: "Reset" }))

        expect(onReset).toHaveBeenCalledTimes(1)
        expect(screen.getByLabelText("Kategori")).toBeInTheDocument()
    })

    it("offers an explicit close action only where a swipe is not available", async () => {
        const user = userEvent.setup()
        renderFilters()

        await user.click(screen.getByRole("button", { name: "Filter produk" }))

        // Phones dismiss the sheet with the drag handle, so the X would be a
        // duplicate affordance there. It is hidden below `md` and shown from
        // `md` up, where a pointer cannot perform a swipe.
        const close = await screen.findByRole("button", { name: "Tutup filter produk" })

        expect(close).toHaveClass("hidden", "md:inline-flex")
        expect(close).not.toHaveClass("inline-flex")
    })

    it("closes the sheet when the desktop close action is used", async () => {
        const user = userEvent.setup()
        renderFilters()

        await user.click(screen.getByRole("button", { name: "Filter produk" }))
        await screen.findByLabelText("Kategori")

        await user.click(screen.getByRole("button", { name: "Tutup filter produk" }))

        await waitFor(() => {
            expect(screen.queryByLabelText("Kategori")).not.toBeInTheDocument()
        })
    })
})
