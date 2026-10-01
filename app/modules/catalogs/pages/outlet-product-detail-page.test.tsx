import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { CAP } from "~/modules/authorization"
import type { OperationalOutlet } from "~/modules/merchant-operations"

import { OutletProductDetailPage } from "./outlet-product-detail-page"
import type { OutletCatalogItem } from "../types"

const { fetchOutletProduct, fetchProduct, useOperationalOutlet, useOutletAuthorization, can } = vi.hoisted(() => ({
    fetchOutletProduct: vi.fn(),
    fetchProduct: vi.fn(),
    useOperationalOutlet: vi.fn(),
    useOutletAuthorization: vi.fn(),
    can: vi.fn(),
}))

vi.mock("../services/outlet-catalog/outlet-catalog.api", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../services/outlet-catalog/outlet-catalog.api")>()

    return { ...actual, fetchOutletProduct }
})

vi.mock("../services/products/product.api", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../services/products/product.api")>()

    return { ...actual, fetchProduct }
})

vi.mock("~/modules/merchant-operations", async (importOriginal) => {
    const actual = await importOriginal<typeof import("~/modules/merchant-operations")>()

    return { ...actual, useOperationalOutlet }
})

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

const ITEM: OutletCatalogItem = {
    product: {
        id: "p1",
        name: "Ayam Geprek",
        description: "Pedas mantap",
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
}

function renderPage() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={["/catalogs/outlets/o1/products/p1"]}>
                <Routes>
                    <Route
                        path="/catalogs/outlets/:outletId/products/:productId"
                        element={<OutletProductDetailPage />}
                    />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    )
}

beforeEach(() => {
    fetchOutletProduct.mockReset()
    fetchProduct.mockReset()
    useOperationalOutlet.mockReset()
    useOutletAuthorization.mockReset()
    can.mockReset()

    fetchOutletProduct.mockResolvedValue(ITEM)
    useOperationalOutlet.mockReturnValue({ data: OUTLET, isPending: false, isError: false, error: null })

    can.mockReturnValue(true)
    useOutletAuthorization.mockReturnValue({ role: "outlet_manager", isLoading: false, isOwner: false, can })
})

describe("OutletProductDetailPage", () => {
    it("loads detail from the outlet-scoped endpoint, never the master one", async () => {
        renderPage()

        expect((await screen.findAllByText("Ayam Geprek")).length).toBeGreaterThan(0)
        expect(fetchOutletProduct).toHaveBeenCalledWith("o1", "p1")
        expect(fetchProduct).not.toHaveBeenCalled()
    })

    it("shows the outlet identity and the outlet state section", async () => {
        renderPage()

        await screen.findAllByText("Ayam Geprek")

        expect(screen.getByText("Outlet Kemang")).toBeInTheDocument()
        expect(screen.getByText("Status di Outlet")).toBeInTheDocument()
        expect(screen.getByRole("switch", { name: "Ketersediaan Outlet Kemang" })).toBeInTheDocument()
    })

    it("keeps assignment status read-only for staff", async () => {
        can.mockImplementation((capability: string) => capability === CAP.catalogAvailabilityUpdate)

        renderPage()

        await screen.findAllByText("Ayam Geprek")

        expect(screen.getByRole("switch", { name: "Ketersediaan Outlet Kemang" })).toBeInTheDocument()
        expect(screen.queryByRole("switch", { name: /Status penugasan/ })).not.toBeInTheDocument()
    })
})
