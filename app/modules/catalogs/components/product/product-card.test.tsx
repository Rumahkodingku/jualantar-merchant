import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { describe, expect, it } from "vitest"

import { ProductCard } from "./product-card"
import { PRODUCT_TYPE_LABEL } from "../../utils/labels"
import type { Product } from "../../types/catalog.types"

const PRODUCT: Product = {
    id: "p1",
    category_id: "c1",
    category: { id: "c1", name: "Makanan", status: "active" },
    name: "Ayam Geprek",
    description: null,
    product_type: "simple",
    price: 18_000,
    status: "active",
    display_order: 1,
    primary_media: null,
    variants_count: 0,
    min_price: null,
    media_count: 0,
    modifier_groups_count: 0,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
}

function renderCard(overrides: Partial<React.ComponentProps<typeof ProductCard>> = {}) {
    return render(
        <MemoryRouter>
            <ProductCard product={PRODUCT} {...overrides} />
        </MemoryRouter>
    )
}

describe("ProductCard", () => {
    it("shows the primary media when the product has one", () => {
        renderCard({
            product: { ...PRODUCT, primary_media: { url: "https://cdn.test/ayam.jpg", alt_text: "Ayam geprek" } },
        })

        expect(screen.getByRole("img", { name: "Ayam geprek" })).toHaveAttribute("src", "https://cdn.test/ayam.jpg")
    })

    it("falls back to the product name when the media has no alt text", () => {
        renderCard({ product: { ...PRODUCT, primary_media: { url: "https://cdn.test/ayam.jpg", alt_text: null } } })

        expect(screen.getByRole("img", { name: PRODUCT.name })).toBeInTheDocument()
    })

    it("falls back to the package icon when the product has no media", () => {
        const { container } = renderCard()

        expect(screen.queryByRole("img")).not.toBeInTheDocument()
        expect(container.querySelector(".lucide-package")).not.toBeNull()
    })

    it("falls back to the package icon when the image fails to load", () => {
        const { container } = renderCard({
            product: { ...PRODUCT, primary_media: { url: "https://cdn.test/missing.jpg", alt_text: null } },
        })

        fireEvent.error(screen.getByRole("img", { name: PRODUCT.name }))

        expect(screen.queryByRole("img")).not.toBeInTheDocument()
        expect(container.querySelector(".lucide-package")).not.toBeNull()
    })

    it("shows the category name carried by the product", () => {
        renderCard()

        expect(screen.getByText(`Makanan • ${PRODUCT_TYPE_LABEL.simple}`)).toBeInTheDocument()
    })

    it("falls back to a placeholder when the product has no category", () => {
        renderCard({ product: { ...PRODUCT, category: null } })

        expect(screen.getByText(`Tanpa kategori • ${PRODUCT_TYPE_LABEL.simple}`)).toBeInTheDocument()
    })

    it("shows the cheapest variant price and the variant count", () => {
        renderCard({
            product: {
                ...PRODUCT,
                product_type: "variable",
                price: null,
                variants_count: 3,
                min_price: 15_000,
            },
        })

        expect(screen.getByText("Mulai dari Rp 15.000")).toBeInTheDocument()
        expect(screen.getByText(`Makanan • ${PRODUCT_TYPE_LABEL.variable} • 3 varian`)).toBeInTheDocument()
    })

    it("keeps the plain variant prompt when no variant is active", () => {
        renderCard({
            product: { ...PRODUCT, product_type: "variable", price: null, variants_count: 0, min_price: null },
        })

        expect(screen.getByText("Lihat varian")).toBeInTheDocument()
        expect(screen.getByText(`Makanan • ${PRODUCT_TYPE_LABEL.variable}`)).toBeInTheDocument()
    })
})
