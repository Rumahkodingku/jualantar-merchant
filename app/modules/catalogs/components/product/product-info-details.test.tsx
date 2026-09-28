import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { ProductInfoDetails } from "./product-info-details"
import type { ProductDetail } from "../../types/catalog.types"

const PRODUCT: ProductDetail = {
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
    description: null,
    product_type: "variable",
    price: null,
    status: "inactive",
    display_order: 0,
    primary_media: null,
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
}

describe("ProductInfoDetails", () => {
    it("renders the read-only detail rows from the summary", () => {
        render(<ProductInfoDetails product={PRODUCT} />)

        expect(screen.getByText("Informasi Produk")).toBeInTheDocument()
        expect(screen.getByText("Makanan")).toBeInTheDocument()
        expect(screen.getByText("Nonaktif")).toBeInTheDocument()
        expect(screen.getByText("Mulai dari Rp 13.000")).toBeInTheDocument()
        expect(screen.getByText("3 variant")).toBeInTheDocument()
        expect(screen.getByText("1 group")).toBeInTheDocument()
        expect(screen.getByText("5 foto")).toBeInTheDocument()
        expect(screen.getByText("1 outlet")).toBeInTheDocument()
    })
})
