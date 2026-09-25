import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"
import { describe, expect, it } from "vitest"
import { CatalogCategoriesPage } from "./categories-page"
import { CatalogsPage } from "./catalogs-page"
import { ProductNewPage } from "./product-new-page"

function renderWithProviders(ui: React.ReactNode, initialEntries: string[] = ["/catalogs"]) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })

    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
        </QueryClientProvider>
    )
}

describe("CatalogsPage", () => {
    it("renders product list from dummy data", async () => {
        renderWithProviders(
            <Routes>
                <Route path="/catalogs" element={<CatalogsPage />} />
            </Routes>
        )

        expect(await screen.findByText("Ayam Geprek")).toBeInTheDocument()
        expect(screen.getByText("Nasi Goreng Spesial")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: /Tambah Produk/ })).toBeInTheDocument()
    })

    it("filters products by search query", async () => {
        const user = userEvent.setup()

        renderWithProviders(
            <Routes>
                <Route path="/catalogs" element={<CatalogsPage />} />
            </Routes>
        )

        await screen.findByText("Ayam Geprek")

        await user.type(screen.getByLabelText("Cari produk"), "Es Teh")

        await waitFor(
            () => {
                expect(screen.getByText("Es Teh Manis")).toBeInTheDocument()
                expect(screen.queryByText("Ayam Geprek")).not.toBeInTheDocument()
            },
            { timeout: 2000 }
        )
    })
})

describe("ProductNewPage", () => {
    it("shows validation error when name is empty", async () => {
        const user = userEvent.setup()

        renderWithProviders(
            <Routes>
                <Route path="/catalogs/new" element={<ProductNewPage />} />
            </Routes>,
            ["/catalogs/new"]
        )

        expect(await screen.findByRole("heading", { name: "Tambah Produk" })).toBeInTheDocument()
        expect(await screen.findByRole("button", { name: "Lanjut" })).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Lanjut" }))

        expect(await screen.findByText("Nama produk wajib diisi.")).toBeInTheDocument()
    })

    it("requires category when advancing past info step", async () => {
        const user = userEvent.setup()

        renderWithProviders(
            <Routes>
                <Route path="/catalogs/new" element={<ProductNewPage />} />
            </Routes>,
            ["/catalogs/new"]
        )

        await screen.findByRole("button", { name: "Lanjut" })

        await user.type(screen.getByLabelText("Nama Produk"), "Burger Spesial")
        await user.click(screen.getByRole("button", { name: "Lanjut" }))

        expect(await screen.findByText("Kategori wajib dipilih.")).toBeInTheDocument()
        expect(screen.getByText("Langkah 1 dari 6")).toBeInTheDocument()
    })
})

describe("CatalogCategoriesPage", () => {
    it("renders categories from dummy data", async () => {
        renderWithProviders(
            <Routes>
                <Route path="/catalogs/categories" element={<CatalogCategoriesPage />} />
            </Routes>,
            ["/catalogs/categories"]
        )

        expect(await screen.findByText("Makanan")).toBeInTheDocument()
        expect(screen.getByText("Minuman")).toBeInTheDocument()
        expect(screen.getByText("Dessert")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: /Tambah Kategori/ })).toBeInTheDocument()
    })

    it("opens create dialog and validates empty name", async () => {
        const user = userEvent.setup()

        renderWithProviders(
            <Routes>
                <Route path="/catalogs/categories" element={<CatalogCategoriesPage />} />
            </Routes>,
            ["/catalogs/categories"]
        )

        await screen.findByText("Makanan")

        await user.click(screen.getByRole("button", { name: /Tambah Kategori/ }))

        expect(await screen.findByRole("dialog")).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Simpan" }))

        expect(await screen.findByText("Nama kategori wajib diisi.")).toBeInTheDocument()
    })
})
