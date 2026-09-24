import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { describe, expect, it } from "vitest"

import { CatalogNewPage } from "./catalog-new-page"
import { CatalogsPage } from "./catalogs-page"

describe("CatalogsPage", () => {
    it("renders the scaffold heading and empty state", () => {
        render(
            <MemoryRouter initialEntries={["/catalogs"]}>
                <CatalogsPage />
            </MemoryRouter>
        )

        expect(screen.getByRole("heading", { name: "Katalog" })).toBeInTheDocument()
        expect(screen.getByText("Belum ada katalog")).toBeInTheDocument()
    })
})

describe("CatalogNewPage", () => {
    it("renders the scaffold form", () => {
        render(
            <MemoryRouter initialEntries={["/catalogs/new"]}>
                <CatalogNewPage />
            </MemoryRouter>
        )

        expect(screen.getByRole("heading", { name: "Tambah Produk" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Simpan produk" })).toBeInTheDocument()
    })
})
