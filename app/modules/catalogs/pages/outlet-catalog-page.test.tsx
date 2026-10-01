import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ApiError } from "~/lib/api"
import type { OperationalOutlet } from "~/modules/merchant-operations"

import { OutletCatalogPage } from "./outlet-catalog-page"
import type { CatalogCategory, OutletCatalogItem } from "../types"

const { fetchOutletProducts, fetchCategories, useOutletCatalogContext, useOutletAuthorization, selectOutlet } =
    vi.hoisted(() => ({
        fetchOutletProducts: vi.fn(),
        fetchCategories: vi.fn(),
        useOutletCatalogContext: vi.fn(),
        useOutletAuthorization: vi.fn(),
        selectOutlet: vi.fn(),
    }))

vi.mock("../services/outlet-catalog/outlet-catalog.api", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../services/outlet-catalog/outlet-catalog.api")>()

    return { ...actual, fetchOutletProducts }
})

vi.mock("../services/categories/category.api", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../services/categories/category.api")>()

    return { ...actual, fetchCategories }
})

vi.mock("../hooks/use-outlet-catalog-context", () => ({ useOutletCatalogContext }))

vi.mock("~/modules/authorization", async (importOriginal) => {
    const actual = await importOriginal<typeof import("~/modules/authorization")>()

    return { ...actual, useOutletAuthorization }
})

const OUTLET: OperationalOutlet = {
    id: "o1",
    merchant_id: "m1",
    name: "Outlet Kemang",
    phone: null,
    email: null,
    address: "Jl. Kemang Raya",
    province_id: 1,
    regency_id: 1,
    district_id: 1,
    village_id: 1,
    postal_code: "12730",
    latitude: 0,
    longitude: 0,
    service_area_type: "radius",
    service_radius_km: 3,
    operating_hours: null,
    photos: [],
    photos_url: [],
    status: "active",
    geography: null,
    created_at: null,
    updated_at: null,
}

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
]

const ITEMS: OutletCatalogItem[] = [
    {
        product: {
            id: "p1",
            name: "Ayam Geprek",
            description: null,
            product_type: "simple",
            price: 18000,
            status: "active",
        },
        category: { id: "cat-001", name: "Makanan", status: "active" },
        variants: [],
        primary_media: null,
        modifier_groups: [],
        assignment: {
            id: "a1",
            status: "active",
            availability_status: "available",
            unavailable_reason: null,
            display_order: 0,
        },
        is_sellable: true,
    },
]

function paginated<T>(data: T[]) {
    return { data, meta: { current_page: 1, per_page: 100, total: data.length, last_page: 1 } }
}

function renderPage() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={["/catalogs?outlet=o1"]}>
                <Routes>
                    <Route path="/catalogs" element={<OutletCatalogPage />} />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    )
}

beforeEach(() => {
    fetchOutletProducts.mockReset()
    fetchCategories.mockReset()
    useOutletCatalogContext.mockReset()
    useOutletAuthorization.mockReset()
    selectOutlet.mockReset()

    fetchOutletProducts.mockResolvedValue(paginated(ITEMS))
    fetchCategories.mockResolvedValue(paginated(CATEGORIES))

    useOutletCatalogContext.mockReturnValue({
        selection: { type: "selected", outletId: "o1" },
        outletId: "o1",
        outlets: [OUTLET],
        selectedOutlet: OUTLET,
        isPending: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
        selectOutlet,
    })

    useOutletAuthorization.mockReturnValue({
        role: "outlet_manager",
        isLoading: false,
        isOwner: false,
        can: () => true,
    })
})

describe("OutletCatalogPage", () => {
    it("renders assigned products without any master create action", async () => {
        renderPage()

        expect(await screen.findByText("Ayam Geprek")).toBeInTheDocument()
        expect(screen.getByText("Outlet Kemang")).toBeInTheDocument()
        expect(screen.queryByRole("link", { name: /Tambah Produk/ })).not.toBeInTheDocument()
    })

    it("requests the outlet-scoped list for the selected outlet", async () => {
        renderPage()

        await screen.findByText("Ayam Geprek")

        expect(fetchOutletProducts).toHaveBeenCalledWith("o1", expect.objectContaining({ per_page: 100 }))
    })

    it("shows a forbidden state when the outlet is out of scope", async () => {
        fetchOutletProducts.mockRejectedValue(
            new ApiError({ status: 403, code: "outlet_scope_forbidden", title: "Forbidden", detail: "" })
        )

        renderPage()

        expect(await screen.findByText("Akses ditolak")).toBeInTheDocument()
    })

    it("shows a not-found state for a foreign outlet", async () => {
        fetchOutletProducts.mockRejectedValue(
            new ApiError({ status: 404, code: "outlet_not_found", title: "Not Found", detail: "" })
        )

        renderPage()

        expect(await screen.findByText("Outlet tidak ditemukan")).toBeInTheDocument()
    })
})
