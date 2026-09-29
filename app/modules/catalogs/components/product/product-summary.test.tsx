import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ProductSummary } from "./product-summary"
import { Tabs } from "~/components/ui/tabs"
import type { ProductDetail } from "../../types/catalog.types"

function makeProduct(overrides: Partial<ProductDetail> = {}): ProductDetail {
    return {
        id: "prd-001",
        category_id: "cat-001",
        category: {
            id: "cat-001",
            name: "Makanan",
            description: null,
            status: "active",
            display_order: 0,
            created_at: null,
            updated_at: null,
        },
        name: "Nasi Goreng",
        description: "Nasi goreng dengan bumbu khas.",
        product_type: "variable",
        price: null,
        status: "inactive",
        display_order: 0,
        primary_media: { url: "https://cdn.test/nasi.jpg", alt_text: null },
        summary: {
            price: { type: "from", value: 13000 },
            variants_count: 3,
            customization_groups_count: 1,
            media_count: 5,
            outlets_count: 1,
        },
        variants: [],
        media: [],
        modifier_groups: [],
        created_at: "2026-09-28T01:32:00Z",
        updated_at: "2026-09-28T01:32:00Z",
        ...overrides,
    }
}

function renderSummary(overrides: Partial<ProductDetail> = {}, onSelectTab = vi.fn()) {
    render(
        <Tabs defaultValue="ringkasan">
            <ProductSummary product={makeProduct(overrides)} onSelectTab={onSelectTab} />
        </Tabs>
    )

    return { onSelectTab }
}

describe("ProductSummary", () => {
    it("renders the product identity", () => {
        renderSummary()

        expect(screen.getByRole("heading", { name: "Nasi Goreng" })).toBeInTheDocument()
        expect(screen.getByText("Nasi goreng dengan bumbu khas.")).toBeInTheDocument()
        expect(screen.getByRole("img", { name: "Nasi Goreng" })).toBeInTheDocument()
    })

    it("uses the 'Mulai dari' label for a from price", () => {
        renderSummary()

        expect(screen.getAllByText("Mulai dari Rp 13.000").length).toBeGreaterThan(0)
    })

    it("renders a plain price for a fixed summary", () => {
        renderSummary({
            product_type: "simple",
            summary: {
                price: { type: "fixed", value: 15000 },
                variants_count: 0,
                customization_groups_count: 0,
                media_count: 0,
                outlets_count: 0,
            },
        })

        expect(screen.getAllByText("Rp 15.000").length).toBeGreaterThan(0)
        expect(screen.queryByText(/Mulai dari/)).not.toBeInTheDocument()
    })

    it("falls back to a copy when the price is unknown", () => {
        renderSummary({
            summary: {
                price: { type: "from", value: null },
                variants_count: 0,
                customization_groups_count: 0,
                media_count: 0,
                outlets_count: 0,
            },
        })

        expect(screen.getAllByText("Harga belum tersedia").length).toBeGreaterThan(0)
    })

    it("renders the tab list with counts from the summary", () => {
        renderSummary()

        expect(screen.getByRole("tab", { name: "Ringkasan" })).toBeInTheDocument()
        expect(screen.getByRole("tab", { name: /Variant/ })).toHaveTextContent("3")
        expect(screen.getByRole("tab", { name: /Customization/ })).toHaveTextContent("1")
        expect(screen.getByRole("tab", { name: /Media/ })).toHaveTextContent("5")
        expect(screen.getByRole("tab", { name: /Outlet/ })).toHaveTextContent("1")
    })

    it("switches to a tab when a summary metric is used", async () => {
        const user = userEvent.setup()
        const { onSelectTab } = renderSummary()

        await user.click(screen.getByRole("button", { name: /Customization/ }))

        expect(onSelectTab).toHaveBeenCalledWith("customization")
    })
})
