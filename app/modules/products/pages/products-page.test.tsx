import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { describe, expect, it } from "vitest"

import { ProductNewPage } from "./product-new-page"
import { ProductsPage } from "./products-page"

describe("ProductsPage", () => {
    it("renders the scaffold heading and empty state", () => {
        render(
            <MemoryRouter initialEntries={["/products"]}>
                <ProductsPage />
            </MemoryRouter>
        )

        expect(screen.getByRole("heading", { name: "Produk" })).toBeInTheDocument()
        expect(screen.getByText("Belum ada produk")).toBeInTheDocument()
    })
})

describe("ProductNewPage", () => {
    it("renders the scaffold form", () => {
        render(
            <MemoryRouter initialEntries={["/products/new"]}>
                <ProductNewPage />
            </MemoryRouter>
        )

        expect(screen.getByRole("heading", { name: "Tambah Produk" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Simpan produk" })).toBeInTheDocument()
    })
})
