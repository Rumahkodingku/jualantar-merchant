import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router"
import { describe, expect, it, vi } from "vitest"

import { ProductFilters } from "./product-filters"
import type { CatalogCategory } from "../../types/catalog.types"

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
                hasFilters={false}
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
            hasFilters: true,
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
})
