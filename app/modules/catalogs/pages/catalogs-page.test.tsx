import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { CatalogCategoriesPage } from "./categories-page"
import { CatalogsPage } from "./catalogs-page"
import { ProductNewPage } from "./product-new-page"
import type { CatalogCategory, Product, ProductIndexParams } from "../types/catalog.types"

const { fetchProducts, fetchCategories, useOperationalOutlets } = vi.hoisted(() => ({
    fetchProducts: vi.fn(),
    fetchCategories: vi.fn(),
    useOperationalOutlets: vi.fn(),
}))

vi.mock("../services/catalog.api", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../services/catalog.api")>()

    return { ...actual, fetchProducts, fetchCategories }
})

vi.mock("~/modules/merchant-operations", async (importOriginal) => {
    const actual = await importOriginal<typeof import("~/modules/merchant-operations")>()

    return { ...actual, useOperationalOutlets }
})

const CATEGORIES: CatalogCategory[] = [
    {
        id: "cat-001",
        name: "Makanan",
        description: null,
        status: "active",
        display_order: 0,
        created_at: null,
        updated_at: null,
    },
    {
        id: "cat-002",
        name: "Minuman",
        description: null,
        status: "active",
        display_order: 1,
        created_at: null,
        updated_at: null,
    },
    {
        id: "cat-003",
        name: "Dessert",
        description: null,
        status: "active",
        display_order: 2,
        created_at: null,
        updated_at: null,
    },
]

const PRODUCTS: Product[] = [
    {
        id: "prd-001",
        category_id: "cat-001",
        name: "Ayam Geprek",
        description: null,
        product_type: "simple",
        price: 18000,
        status: "active",
        display_order: 0,
        created_at: null,
        updated_at: null,
    },
    {
        id: "prd-002",
        category_id: "cat-001",
        name: "Nasi Goreng Spesial",
        description: null,
        product_type: "variable",
        price: null,
        status: "active",
        display_order: 1,
        created_at: null,
        updated_at: null,
    },
    {
        id: "prd-003",
        category_id: "cat-002",
        name: "Es Teh Manis",
        description: null,
        product_type: "simple",
        price: 5000,
        status: "active",
        display_order: 2,
        created_at: null,
        updated_at: null,
    },
]

function paginated<T>(data: T[]) {
    return { data, meta: { current_page: 1, per_page: 15, total: data.length, last_page: 1 } }
}

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

beforeEach(() => {
    fetchProducts.mockReset()
    fetchCategories.mockReset()
    useOperationalOutlets.mockReset()

    fetchProducts.mockImplementation((params: ProductIndexParams = {}) => {
        const search = params.search?.trim().toLowerCase()
        const products =
            search === undefined || search === ""
                ? PRODUCTS
                : PRODUCTS.filter((product) => product.name.toLowerCase().includes(search))

        return Promise.resolve(paginated(products))
    })

    fetchCategories.mockImplementation(() => Promise.resolve(paginated(CATEGORIES)))

    useOperationalOutlets.mockReturnValue({
        data: paginated([]),
        isPending: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
    })
})

describe("CatalogsPage", () => {
    it("renders the product list from the API", async () => {
        renderWithProviders(
            <Routes>
                <Route path="/catalogs" element={<CatalogsPage />} />
            </Routes>
        )

        expect(await screen.findByText("Ayam Geprek")).toBeInTheDocument()
        expect(screen.getByText("Nasi Goreng Spesial")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: /Tambah Produk/ })).toBeInTheDocument()
    })

    it("sends the search term to the API and renders the narrowed result", async () => {
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

        expect(fetchProducts).toHaveBeenCalledWith(expect.objectContaining({ search: "Es Teh" }))
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

        await user.type(screen.getByLabelText(/Nama Produk/), "Burger Spesial")
        await user.click(screen.getByRole("button", { name: "Lanjut" }))

        expect(await screen.findByText("Kategori wajib dipilih.")).toBeInTheDocument()
        expect(screen.getByText("Langkah 1 dari 6")).toBeInTheDocument()
    })

    it("shows the selected category name instead of its id", async () => {
        const user = userEvent.setup()

        renderWithProviders(
            <Routes>
                <Route path="/catalogs/new" element={<ProductNewPage />} />
            </Routes>,
            ["/catalogs/new"]
        )

        const trigger = await screen.findByRole("combobox", { name: /Kategori Produk/ })

        expect(trigger).toHaveTextContent("Pilih kategori")

        await user.click(trigger)
        await user.click(await screen.findByRole("option", { name: "Makanan" }))

        await waitFor(() => {
            expect(trigger).toHaveTextContent("Makanan")
        })

        expect(trigger).not.toHaveTextContent("cat-001")
    })
})

describe("CatalogCategoriesPage", () => {
    it("renders categories from the API", async () => {
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
