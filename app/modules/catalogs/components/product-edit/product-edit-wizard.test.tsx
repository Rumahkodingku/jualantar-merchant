import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RouterProvider, createMemoryRouter } from "react-router"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { ProductEditWizard } from "./product-edit-wizard"
import { toEditForm } from "../../services/product-edit/to-edit-form"
import type { EditSnapshot, ProductDetail } from "../../types"

const api = vi.hoisted(() => ({
    updateProduct: vi.fn(),
    updateProductVariant: vi.fn(),
    createProductVariant: vi.fn(),
    deactivateProductVariant: vi.fn(),
    deleteProductVariant: vi.fn(),
    createProductModifier: vi.fn(),
    deleteProductModifier: vi.fn(),
    deleteProductModifierGroup: vi.fn(),
    deleteProductMedia: vi.fn(),
    createProductMedia: vi.fn(),
    setPrimaryProductMedia: vi.fn(),
    replaceProductOutlets: vi.fn(),
    fetchProductMedia: vi.fn(),
    createProductMediaUploadUrl: vi.fn(),
}))

vi.mock("../../services/products/product.api", () => ({ updateProduct: api.updateProduct }))
vi.mock("../../services/variants/variant.api", () => ({
    updateProductVariant: api.updateProductVariant,
    createProductVariant: api.createProductVariant,
    activateProductVariant: vi.fn(),
    deactivateProductVariant: api.deactivateProductVariant,
    deleteProductVariant: api.deleteProductVariant,
    reorderProductVariants: vi.fn(),
}))
vi.mock("../../services/modifiers/modifier.api", () => ({
    updateProductModifierGroup: vi.fn(),
    createProductModifierGroup: vi.fn(),
    deleteProductModifierGroup: api.deleteProductModifierGroup,
    createProductModifier: api.createProductModifier,
    updateProductModifier: vi.fn(),
    deleteProductModifier: api.deleteProductModifier,
    reorderProductModifierGroups: vi.fn(),
    activateProductModifierGroup: vi.fn(),
    deactivateProductModifierGroup: vi.fn(),
    activateProductModifier: vi.fn(),
    deactivateProductModifier: vi.fn(),
    reorderProductModifiers: vi.fn(),
}))
vi.mock("../../services/media/media.api", () => ({
    deleteProductMedia: api.deleteProductMedia,
    createProductMedia: api.createProductMedia,
    setPrimaryProductMedia: api.setPrimaryProductMedia,
    reorderProductMedia: vi.fn(),
    createProductMediaUploadUrl: api.createProductMediaUploadUrl,
    fetchProductMedia: api.fetchProductMedia,
}))
vi.mock("../../services/product-outlets/product-outlet.api", () => ({
    replaceProductOutlets: api.replaceProductOutlets,
}))

const CATEGORIES = [{ id: "c1", name: "Makanan" }]
const OUTLETS = [
    { id: "o1", name: "Outlet Utama", status: "active" as const },
    { id: "o2", name: "Outlet Cabang", status: "active" as const },
]

function product(overrides: Partial<ProductDetail> = {}): ProductDetail {
    return {
        id: "p1",
        category_id: "c1",
        category: {
            id: "c1",
            name: "Makanan",
            description: null,
            status: "active",
            display_order: 0,
            created_at: null,
            updated_at: null,
        },
        name: "Ayam Geprek",
        description: "Enak",
        product_type: "simple",
        price: 18000,
        status: "active",
        display_order: 0,
        summary: {
            price: { type: "fixed", value: 18000 },
            variants_count: 0,
            customization_groups_count: 0,
            media_count: 0,
            outlets_count: 1,
        },
        variants: [],
        modifier_groups: [],
        media: [],
        created_at: null,
        updated_at: null,
        ...overrides,
    }
}

function snapshotOf(target: ProductDetail, outletIds: string[]): EditSnapshot {
    return {
        name: target.name,
        category_id: target.category_id,
        description: target.description ?? null,
        price: target.price,
        outletIds,
        variants: target.variants ?? [],
        groups: target.modifier_groups ?? [],
        media: target.media ?? [],
    }
}

function renderWizard(target: ProductDetail, outletIds: string[] = ["o1"], onSaved = vi.fn()) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    // A data router, because the leave guard blocks navigation through one — the
    // same shape the app's own router has.
    const router = createMemoryRouter(
        [
            {
                path: "/catalogs/products/:productId/edit",
                element: (
                    <ProductEditWizard
                        productId={target.id}
                        productName={target.name}
                        productType={target.product_type}
                        categories={CATEGORIES}
                        outlets={OUTLETS}
                        assignments={[]}
                        isOutletsPending={false}
                        isOutletsError={false}
                        onRetryOutlets={() => undefined}
                        form={toEditForm(target, outletIds)}
                        snapshot={snapshotOf(target, outletIds)}
                        onSaved={onSaved}
                        onExit={() => void router.navigate(`/catalogs/products/${target.id}`)}
                    />
                ),
            },
            { path: "/catalogs/products/:productId", element: <p>Detail produk</p> },
        ],
        { initialEntries: ["/catalogs/products/p1/edit"] }
    )

    render(
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    )

    return { onSaved, router }
}

beforeEach(() => {
    vi.clearAllMocks()

    for (const mock of Object.values(api)) {
        mock.mockResolvedValue({})
    }
})

describe("the wizard walks the same six steps as the create screen", () => {
    it("opens on the product's own information, with its type already settled", () => {
        renderWizard(product())

        expect(screen.getByText("Informasi produk")).toBeInTheDocument()
        expect(screen.getByText("Langkah 1 dari 6")).toBeInTheDocument()

        // The type cannot be changed after a product exists, so it is shown as
        // the answer rather than offered as a choice.
        expect(screen.getByLabelText("Tipe Produk")).toHaveValue("Simple")
        expect(screen.queryByRole("radio")).not.toBeInTheDocument()
    })

    it("reaches every step and back again", async () => {
        const user = userEvent.setup()

        renderWizard(product())

        const forward = screen.getByRole("button", { name: /Lanjut/ })

        await user.click(forward)
        expect(screen.getByText("Harga")).toBeInTheDocument()

        await user.click(forward)
        expect(screen.getByText(/Tambahkan modifier group/)).toBeInTheDocument()

        await user.click(forward)
        expect(screen.getByText("Foto Produk")).toBeInTheDocument()

        await user.click(forward)
        expect(screen.getByText("Produk tersedia di:")).toBeInTheDocument()

        await user.click(forward)
        expect(screen.getByText("Review Produk")).toBeInTheDocument()

        const back = screen.getByRole("button", { name: /Kembali/ })

        await user.click(back)
        expect(screen.getByText("Outlet", { selector: "h2" })).toBeInTheDocument()
    })
})

describe("nothing is sent until the merchant says so", () => {
    it("holds the change while the merchant is still walking the steps", async () => {
        const user = userEvent.setup()

        renderWizard(product())

        await user.clear(screen.getByLabelText(/Nama Produk/))
        await user.type(screen.getByLabelText(/Nama Produk/), "Ayam Geprek Sambal")
        await user.click(screen.getByRole("button", { name: /Lanjut/ }))

        expect(api.updateProduct).not.toHaveBeenCalled()
    })

    it("saves on the last step and reports success", async () => {
        const user = userEvent.setup()
        const { onSaved } = renderWizard(product())

        await user.clear(screen.getByLabelText(/Nama Produk/))
        await user.type(screen.getByLabelText(/Nama Produk/), "Ayam Geprek Sambal")

        for (let step = 0; step < 5; step += 1) {
            await user.click(screen.getByRole("button", { name: /Lanjut/ }))
        }

        await user.click(screen.getByRole("button", { name: "Simpan Perubahan" }))

        await waitFor(() => expect(onSaved).toHaveBeenCalled())

        expect(api.updateProduct).toHaveBeenCalledWith("p1", {
            name: "Ayam Geprek Sambal",
            category_id: "c1",
            description: "Enak",
            price: 18000,
        })
    })

    it("says so rather than pretending to save when nothing was touched", async () => {
        const user = userEvent.setup()
        const { onSaved } = renderWizard(product())

        for (let step = 0; step < 5; step += 1) {
            await user.click(screen.getByRole("button", { name: /Lanjut/ }))
        }

        await user.click(screen.getByRole("button", { name: "Simpan Perubahan" }))

        await waitFor(() => expect(onSaved).toHaveBeenCalled())

        expect(api.updateProduct).not.toHaveBeenCalled()
    })
})

describe("a step the merchant cannot leave is explained, not silently swallowed", () => {
    it("will not move on from an empty name", async () => {
        const user = userEvent.setup()

        renderWizard(product())

        await user.clear(screen.getByLabelText(/Nama Produk/))
        await user.click(screen.getByRole("button", { name: /Lanjut/ }))

        expect(screen.getByText("Nama produk wajib diisi.")).toBeInTheDocument()
        expect(screen.getByText("Informasi produk")).toBeInTheDocument()
    })

    it("will not leave a variable product with no variant at all", async () => {
        const user = userEvent.setup()

        renderWizard(
            product({
                product_type: "variable",
                price: null,
                variants: [
                    {
                        id: "v1",
                        name: "Reguler",
                        sku: null,
                        price: 18000,
                        status: "active",
                        is_default: true,
                        display_order: 0,
                        created_at: null,
                        updated_at: null,
                    },
                ],
            })
        )

        await user.click(screen.getByRole("button", { name: /Lanjut/ }))
        expect(screen.getByRole("button", { name: "Hapus Reguler" })).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Hapus Reguler" }))
        await user.click(screen.getByRole("button", { name: /Lanjut/ }))

        expect(screen.getByRole("alert")).toHaveTextContent("Sisakan minimal satu variant.")
    })
})

describe("a variable product's variants are patched by the id they already have", () => {
    it("updates a renamed variant and deactivates one the merchant switched off", async () => {
        const user = userEvent.setup()

        renderWizard(
            product({
                product_type: "variable",
                price: null,
                variants: [
                    {
                        id: "v1",
                        name: "Reguler",
                        sku: null,
                        price: 18000,
                        status: "active",
                        is_default: true,
                        display_order: 0,
                        created_at: null,
                        updated_at: null,
                    },
                ],
            })
        )

        await user.click(screen.getByRole("button", { name: /Lanjut/ }))
        await user.click(screen.getByRole("button", { name: /Ubah Reguler/ }))

        const dialog = await screen.findByRole("dialog")

        await user.clear(within(dialog).getByLabelText("Nama"))
        await user.type(within(dialog).getByLabelText("Nama"), "Reguler Besar")
        await user.click(within(dialog).getByRole("switch", { name: "Status aktif variant" }))
        await user.click(within(dialog).getByRole("button", { name: "Simpan" }))

        for (let step = 0; step < 4; step += 1) {
            await user.click(screen.getByRole("button", { name: /Lanjut/ }))
        }

        await user.click(screen.getByRole("button", { name: "Simpan Perubahan" }))

        await waitFor(() => expect(api.updateProductVariant).toHaveBeenCalled())

        expect(api.updateProductVariant).toHaveBeenCalledWith("p1", "v1", { name: "Reguler Besar" })
        expect(api.deactivateProductVariant).toHaveBeenCalledWith("p1", "v1")
    })
})

describe("leaving an unsaved edit asks before throwing the work away", () => {
    it("warns, then leaves once the merchant says so", async () => {
        const user = userEvent.setup()

        renderWizard(product())

        await user.clear(screen.getByLabelText(/Nama Produk/))
        await user.type(screen.getByLabelText(/Nama Produk/), "Ayam Geprek Sambal")

        await user.click(screen.getByRole("button", { name: /Kembali/ }))

        expect(screen.getByText("Tinggalkan tanpa menyimpan?")).toBeInTheDocument()
        expect(screen.getByText("Informasi produk")).toBeInTheDocument()

        await user.click(screen.getByRole("button", { name: "Tinggalkan" }))

        expect(await screen.findByText("Detail produk")).toBeInTheDocument()
    })

    it("stays put when the merchant changes their mind", async () => {
        const user = userEvent.setup()

        renderWizard(product())

        await user.clear(screen.getByLabelText(/Nama Produk/))
        await user.type(screen.getByLabelText(/Nama Produk/), "Ayam Geprek Sambal")

        await user.click(screen.getByRole("button", { name: /Kembali/ }))
        await user.click(screen.getByRole("button", { name: "Batal" }))

        await waitFor(() => expect(screen.queryByText("Tinggalkan tanpa menyimpan?")).not.toBeInTheDocument())

        expect(screen.getByText("Informasi produk")).toBeInTheDocument()
        expect(screen.getByLabelText(/Nama Produk/)).toHaveValue("Ayam Geprek Sambal")
    })

    it("leaves without asking when there is nothing to lose", async () => {
        const user = userEvent.setup()

        renderWizard(product())

        await user.click(screen.getByRole("button", { name: /Kembali/ }))

        expect(screen.queryByText("Tinggalkan tanpa menyimpan?")).not.toBeInTheDocument()
        expect(await screen.findByText("Detail produk")).toBeInTheDocument()
    })

    it("stops warning once the merchant puts the form back as it was", async () => {
        const user = userEvent.setup()

        renderWizard(product())

        const name = screen.getByLabelText(/Nama Produk/)
        const original = (name as HTMLInputElement).value

        await user.clear(name)
        await user.type(name, "Ayam Geprek Sambal")
        await user.clear(name)
        await user.type(name, original)

        await user.click(screen.getByRole("button", { name: /Kembali/ }))

        expect(screen.queryByText("Tinggalkan tanpa menyimpan?")).not.toBeInTheDocument()
        expect(await screen.findByText("Detail produk")).toBeInTheDocument()
    })
})
