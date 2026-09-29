import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ProductDetailPage } from "./product-detail-page"
import type { OperationalOutlet } from "~/modules/merchant-operations"
import type {
    OutletProductAssignment,
    ProductDetail,
    ProductMedia,
    ProductModifierGroup,
    ProductVariant,
} from "../types"

const { fetchProduct, fetchProductOutlets, useOperationalOutlets } = vi.hoisted(() => ({
    fetchProduct: vi.fn(),
    fetchProductOutlets: vi.fn(),
    useOperationalOutlets: vi.fn(),
}))

vi.mock("../services/catalog.api", async (importOriginal) => {
    const actual = await importOriginal<typeof import("../services/catalog.api")>()

    return { ...actual, fetchProduct, fetchProductOutlets }
})

vi.mock("~/modules/merchant-operations", async (importOriginal) => {
    const actual = await importOriginal<typeof import("~/modules/merchant-operations")>()

    return { ...actual, useOperationalOutlets }
})

const VARIANTS: ProductVariant[] = [
    {
        id: "v1",
        name: "Regular",
        sku: "REG-1",
        price: 13000,
        status: "active",
        is_default: true,
        display_order: 0,
        created_at: null,
        updated_at: null,
    },
    {
        id: "v2",
        name: "Jumbo",
        sku: null,
        price: 20000,
        status: "active",
        is_default: false,
        display_order: 1,
        created_at: null,
        updated_at: null,
    },
    {
        id: "v3",
        name: "Spesial",
        sku: null,
        price: 25000,
        status: "inactive",
        is_default: false,
        display_order: 2,
        created_at: null,
        updated_at: null,
    },
]

const MEDIA: ProductMedia[] = [0, 1, 2].map((index) => ({
    id: `m${index + 1}`,
    url: `https://cdn.test/${index + 1}.jpg`,
    alt_text: `Foto ${index + 1}`,
    mime_type: "image/jpeg",
    file_size: null,
    is_primary: index === 0,
    display_order: index,
    created_at: null,
    updated_at: null,
}))

const GROUPS: ProductModifierGroup[] = [
    {
        id: "g1",
        name: "Pilihan Sambal",
        description: null,
        selection_type: "multiple",
        min_selection: 0,
        max_selection: 3,
        is_required: false,
        status: "active",
        display_order: 0,
        created_at: null,
        updated_at: null,
        modifiers: [
            {
                id: "mo1",
                name: "Sambal Matah",
                description: null,
                price: 2000,
                is_default: false,
                status: "active",
                display_order: 0,
                created_at: null,
                updated_at: null,
            },
        ],
    },
]

const ASSIGNMENTS: OutletProductAssignment[] = [
    {
        id: "asg1",
        product_id: "prd-001",
        outlet_id: "o1",
        outlet: { id: "o1", name: "Outlet Utama", status: "active" },
        status: "active",
        availability_status: "available",
        unavailable_reason: null,
        display_order: 0,
        created_at: null,
        updated_at: null,
    },
]

const OUTLET_DIRECTORY: OperationalOutlet = {
    id: "o1",
    merchant_id: "mch-001",
    name: "Outlet Utama",
    phone: "0812-3456-7890",
    email: "outlet.utama@jualantar.test",
    address: "Jl. Merdeka No. 1",
    province_id: 1,
    regency_id: 2,
    district_id: 3,
    village_id: 4,
    postal_code: "60111",
    latitude: "-7.25790500",
    longitude: "112.75212000",
    service_area_type: "radius",
    service_radius_km: "5.00",
    operating_hours: null,
    photos: [],
    photos_url: [],
    status: "active",
    // Village and district intentionally share a name: the location line should
    // collapse the repeat instead of printing "Tunjungan" twice.
    geography: {
        village: "Tunjungan",
        district: "Tunjungan",
        regency: "Surabaya",
        province: "Jawa Timur",
    },
    created_at: null,
    updated_at: null,
}

function outletDirectory(outlets: OperationalOutlet[]) {
    return {
        data: {
            data: outlets,
            meta: { current_page: 1, per_page: 100, total: outlets.length, last_page: 1 },
        },
        isPending: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
    }
}

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
    description: "Nasi goreng dengan bumbu khas.",
    product_type: "variable",
    price: null,
    status: "inactive",
    display_order: 0,
    primary_media: { url: "https://cdn.test/1.jpg", alt_text: "Foto 1" },
    summary: {
        price: { type: "from", value: 13000 },
        variants_count: 3,
        customization_groups_count: 1,
        media_count: 5,
        outlets_count: 1,
    },
    variants: VARIANTS,
    media: MEDIA,
    modifier_groups: GROUPS,
    created_at: "2026-09-28T01:32:00Z",
    updated_at: "2026-09-28T01:32:00Z",
}

function renderPage(initialEntries: string[] = ["/catalogs/products/prd-001"]) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    return render(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={initialEntries}>
                <Routes>
                    <Route path="/catalogs/products/:productId" element={<ProductDetailPage />} />
                </Routes>
            </MemoryRouter>
        </QueryClientProvider>
    )
}

beforeEach(() => {
    fetchProduct.mockReset()
    fetchProductOutlets.mockReset()
    useOperationalOutlets.mockReset()

    fetchProduct.mockResolvedValue(PRODUCT)
    fetchProductOutlets.mockResolvedValue(ASSIGNMENTS)
    useOperationalOutlets.mockReturnValue(outletDirectory([OUTLET_DIRECTORY]))
})

describe("ProductDetailPage", () => {
    it("shows the product summary and opens on the Ringkasan tab", async () => {
        renderPage()

        expect((await screen.findAllByRole("heading", { name: "Nasi Goreng" })).length).toBeGreaterThan(0)
        expect(screen.getAllByText("Mulai dari Rp 13.000").length).toBeGreaterThan(0)

        expect(screen.getByRole("tab", { name: "Ringkasan" })).toHaveAttribute("aria-selected", "true")
        expect(screen.getByText("Informasi Produk")).toBeInTheDocument()
        expect(screen.getByText("3 variant")).toBeInTheDocument()
    })

    it("reads the tab counts from the summary", async () => {
        renderPage()

        await screen.findByText("Informasi Produk")

        expect(screen.getByRole("tab", { name: /Variant/ })).toHaveTextContent("3")
        expect(screen.getByRole("tab", { name: /Customization/ })).toHaveTextContent("1")
        expect(screen.getByRole("tab", { name: /Media/ })).toHaveTextContent("5")
        expect(screen.getByRole("tab", { name: /Outlet/ })).toHaveTextContent("1")
    })

    it("opens on a deep-linked tab", async () => {
        renderPage(["/catalogs/products/prd-001?tab=media"])

        expect(await screen.findByLabelText("Buka foto 1")).toBeInTheDocument()
        expect(screen.getByRole("tab", { name: /Media/ })).toHaveAttribute("aria-selected", "true")
    })

    it("renders the Variant tab read-only", async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText("Informasi Produk")
        await user.click(screen.getByRole("tab", { name: /Variant/ }))

        expect(await screen.findByText("Regular")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: /Tambah Variant/i })).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: /hapus|ubah/i })).not.toBeInTheDocument()
    })

    it("renders the Customization tab read-only", async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText("Informasi Produk")
        await user.click(screen.getByRole("tab", { name: /Customization/ }))

        expect(await screen.findByText("Pilihan Sambal")).toBeInTheDocument()
        expect(screen.getByText("Sambal Matah")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: /Tambah Modifier/i })).not.toBeInTheDocument()
    })

    it("renders the Media tab without upload or delete controls", async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText("Informasi Produk")
        await user.click(screen.getByRole("tab", { name: /Media/ }))

        expect(await screen.findByLabelText("Buka foto 1")).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: /unggah|hapus|utama/i })).not.toBeInTheDocument()
    })

    it("loads the outlet assignments only when the Outlet tab opens", async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText("Informasi Produk")
        expect(fetchProductOutlets).not.toHaveBeenCalled()

        await user.click(screen.getByRole("tab", { name: /Outlet/ }))

        expect(await screen.findByText("Outlet Utama")).toBeInTheDocument()
        expect(fetchProductOutlets).toHaveBeenCalledWith("prd-001")
        expect(useOperationalOutlets).toHaveBeenCalledWith(
            { per_page: 100 },
            expect.objectContaining({ enabled: true })
        )
    })

    it("shows the full outlet record joined from the outlet directory", async () => {
        const user = userEvent.setup()
        renderPage(["/catalogs/products/prd-001?tab=outlet"])

        await screen.findByText("Outlet Utama")

        // The address shows twice by design: a truncated scan line in the
        // trigger and the full untruncated value in the detail panel.
        expect(screen.getByText("Alamat Operasional")).toBeInTheDocument()
        expect(screen.getAllByText("Jl. Merdeka No. 1, Tunjungan, Surabaya, Jawa Timur")).toHaveLength(2)
        expect(screen.getByText("0812-3456-7890")).toBeInTheDocument()
        expect(screen.getByText("outlet.utama@jualantar.test")).toBeInTheDocument()
    })

    it("falls back to the assignment summary when the outlet is missing from the directory", async () => {
        useOperationalOutlets.mockReturnValue(outletDirectory([]))
        renderPage(["/catalogs/products/prd-001?tab=outlet"])

        expect(await screen.findByText("Outlet Utama")).toBeInTheDocument()
        expect(screen.getByText("Rincian alamat outlet tidak tersedia.")).toBeInTheDocument()
        expect(screen.queryByText("0812-3456-7890")).not.toBeInTheDocument()
    })

    it("moves focus with arrow keys and selects with Enter", async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText("Informasi Produk")

        const ringkasanTab = screen.getByRole("tab", { name: "Ringkasan" })
        ringkasanTab.focus()
        expect(ringkasanTab).toHaveAttribute("aria-selected", "true")

        await user.keyboard("{ArrowRight}")

        const variantTab = screen.getByRole("tab", { name: /Variant/ })
        await waitFor(() => expect(variantTab).toHaveFocus())

        await user.keyboard("{Enter}")

        await waitFor(() => expect(variantTab).toHaveAttribute("aria-selected", "true"))
        expect(screen.getByText("Regular")).toBeInTheDocument()
    })

    it("opens the photo viewer with next/previous/close and keyboard", async () => {
        const user = userEvent.setup()
        renderPage()

        await screen.findByText("Informasi Produk")
        await user.click(screen.getByRole("tab", { name: /Media/ }))
        await user.click(await screen.findByLabelText("Buka foto 1"))

        expect(await screen.findByRole("dialog")).toBeInTheDocument()
        expect(screen.getByText("1 / 3")).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Foto berikutnya" }))
        expect(screen.getByText("2 / 3")).toBeInTheDocument()

        fireEvent.keyDown(screen.getByRole("dialog"), { key: "ArrowRight" })
        expect(screen.getByText("3 / 3")).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Foto sebelumnya" }))
        expect(screen.getByText("2 / 3")).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Close" }))
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    })
})
