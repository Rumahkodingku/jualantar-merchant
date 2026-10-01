import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { CAP } from "~/modules/authorization"
import type { OperationalOutlet } from "~/modules/merchant-operations"

import { OutletProductDetailPage } from "./outlet-product-detail-page"
import type { OutletCatalogItem } from "../types"

const {
    fetchOutletProduct,
    fetchProduct,
    deactivateOutletItem,
    resetOutletItem,
    useOperationalOutlet,
    useOutletAuthorization,
    can,
} = vi.hoisted(() => ({
    fetchOutletProduct: vi.fn(),
    fetchProduct: vi.fn(),
    deactivateOutletItem: vi.fn(),
    resetOutletItem: vi.fn(),
    useOperationalOutlet: vi.fn(),
    useOutletAuthorization: vi.fn(),
    can: vi.fn(),
}))

vi.mock("../services/outlet-catalog/outlet-catalog.api", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../services/outlet-catalog/outlet-catalog.api")>()

    return { ...actual, fetchOutletProduct, deactivateOutletItem, resetOutletItem }
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

const VARIANT_ITEM: OutletCatalogItem = {
    ...ITEM,
    product: { ...ITEM.product, product_type: "variable", price: null },
    variants: [
        {
            id: "v-keep",
            name: "Reguler",
            sku: "REG-1",
            price: 20000,
            status: "active",
            effective_status: "active",
            is_overridden: false,
            is_default: true,
        },
        {
            id: "v-hidden",
            name: "Extra Pedas",
            sku: "EXT-2",
            price: 24000,
            status: "active",
            effective_status: "inactive",
            is_overridden: true,
            is_default: false,
        },
    ],
    modifier_groups: [
        {
            id: "g1",
            name: "Level Pedas",
            description: null,
            selection_type: "single",
            min_selection: 1,
            max_selection: 1,
            is_required: true,
            status: "active",
            effective_status: "active",
            is_overridden: false,
            display_order: 1,
            created_at: null,
            updated_at: null,
            modifiers: [
                {
                    id: "m1",
                    name: "Sambal",
                    description: null,
                    price: 3000,
                    is_default: true,
                    status: "active",
                    effective_status: "active",
                    is_overridden: false,
                    display_order: 1,
                    created_at: null,
                    updated_at: null,
                },
            ],
        },
    ],
}

beforeEach(() => {
    fetchOutletProduct.mockReset()
    fetchProduct.mockReset()
    deactivateOutletItem.mockReset()
    resetOutletItem.mockReset()
    deactivateOutletItem.mockResolvedValue({
        subject_type: "variant",
        item_id: "v-keep",
        outlet_id: "o1",
        outlet_name: "Outlet Kemang",
        status: "inactive",
        deactivated_at: null,
        deactivated_by: null,
    })
    resetOutletItem.mockResolvedValue(undefined)
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

    describe("per-outlet item status", () => {
        it("gives a manager a switch on every variant and customization option", async () => {
            fetchOutletProduct.mockResolvedValue(VARIANT_ITEM)

            renderPage()

            await screen.findAllByText("Ayam Geprek")

            expect(screen.getByRole("switch", { name: "Status Reguler di outlet ini" })).toBeInTheDocument()
            expect(screen.getByRole("switch", { name: "Status Extra Pedas di outlet ini" })).toBeInTheDocument()
            expect(screen.getByRole("switch", { name: "Status Level Pedas di outlet ini" })).toBeInTheDocument()
            expect(screen.getByRole("switch", { name: "Status Sambal di outlet ini" })).toBeInTheDocument()
        })

        it("hides a variant at this outlet without touching the master status", async () => {
            fetchOutletProduct.mockResolvedValue(VARIANT_ITEM)

            renderPage()
            await screen.findAllByText("Ayam Geprek")

            await userEvent.click(screen.getByRole("switch", { name: "Status Reguler di outlet ini" }))

            await waitFor(() => expect(deactivateOutletItem).toHaveBeenCalledTimes(1))
            expect(deactivateOutletItem).toHaveBeenCalledWith("o1", "p1", {
                kind: "variant",
                itemId: "v-keep",
            })
            expect(resetOutletItem).not.toHaveBeenCalled()
        })

        it("drops the override to bring a hidden item back", async () => {
            fetchOutletProduct.mockResolvedValue(VARIANT_ITEM)

            renderPage()
            await screen.findAllByText("Ayam Geprek")

            await userEvent.click(screen.getByRole("switch", { name: "Status Extra Pedas di outlet ini" }))

            await waitFor(() => expect(resetOutletItem).toHaveBeenCalledTimes(1))
            expect(resetOutletItem).toHaveBeenCalledWith("o1", "p1", {
                kind: "variant",
                itemId: "v-hidden",
            })
        })

        it("nests a customization option under its group", async () => {
            fetchOutletProduct.mockResolvedValue(VARIANT_ITEM)

            renderPage()
            await screen.findAllByText("Ayam Geprek")

            await userEvent.click(screen.getByRole("switch", { name: "Status Sambal di outlet ini" }))

            await waitFor(() => expect(deactivateOutletItem).toHaveBeenCalledTimes(1))
            expect(deactivateOutletItem).toHaveBeenCalledWith("o1", "p1", {
                kind: "modifier",
                groupId: "g1",
                itemId: "m1",
            })
        })

        it("keeps every item read-only for staff", async () => {
            fetchOutletProduct.mockResolvedValue(VARIANT_ITEM)
            can.mockImplementation(
                (capability: string) =>
                    capability === CAP.catalogAvailabilityUpdate || capability === CAP.catalogAssignmentStatusUpdate
            )

            renderPage()
            await screen.findAllByText("Ayam Geprek")

            expect(screen.queryByRole("switch", { name: /di outlet ini/ })).not.toBeInTheDocument()
            expect(screen.queryByRole("switch", { name: /Status penugasan/ })).toBeInTheDocument()
        })

        it("marks an item the owner deactivated without offering a switch", async () => {
            fetchOutletProduct.mockResolvedValue({
                ...VARIANT_ITEM,
                variants: [
                    {
                        ...VARIANT_ITEM.variants[0]!,
                        status: "inactive",
                        effective_status: "inactive",
                        is_overridden: false,
                    },
                ],
                modifier_groups: [],
            })

            renderPage()
            await screen.findAllByText("Ayam Geprek")

            expect(screen.queryByRole("switch", { name: "Status Reguler di outlet ini" })).not.toBeInTheDocument()
            expect(screen.getAllByText("Nonaktif di katalog pusat").length).toBeGreaterThan(0)
        })

        it("tells a manager when an item differs from the master catalog", async () => {
            fetchOutletProduct.mockResolvedValue(VARIANT_ITEM)

            renderPage()
            await screen.findAllByText("Ayam Geprek")

            expect(screen.getAllByText("Berbeda dari katalog pusat").length).toBeGreaterThan(0)
        })
    })
})
