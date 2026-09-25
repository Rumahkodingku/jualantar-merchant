import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useCreateProductBundle, type ProductBundleInput } from "./catalog.mutations"

const { repository, putToStorage } = vi.hoisted(() => ({
    repository: {
        products: { create: vi.fn() },
        variants: { create: vi.fn() },
        modifierGroups: { create: vi.fn() },
        modifiers: { create: vi.fn() },
        media: { createUploadUrl: vi.fn(), create: vi.fn() },
        productOutlets: { replace: vi.fn() },
    },
    putToStorage: vi.fn(),
}))

vi.mock("./catalog.repository", () => ({ catalogRepository: repository }))
vi.mock("~/lib/api", () => ({ putToStorage }))

const PRODUCT = {
    id: "p1",
    category_id: "c1",
    name: "Ayam Geprek",
    description: null,
    product_type: "simple" as const,
    price: 18000,
    status: "active" as const,
    display_order: 0,
    created_at: null,
    updated_at: null,
}

function buildInput(mediaCount = 1): ProductBundleInput {
    return {
        product: { category_id: "c1", name: "Ayam Geprek", product_type: "simple", price: 18000 },
        variants: [],
        modifierGroups: [],
        media: Array.from({ length: mediaCount }, (_, index) => ({
            file: new File(["x"], `foto-${index}.jpg`, { type: "image/jpeg" }),
            alt_text: null,
            is_primary: index === 0,
        })),
        outletIds: [],
    }
}

function renderBundle() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    return renderHook(() => useCreateProductBundle(), {
        wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    })
}

beforeEach(() => {
    vi.clearAllMocks()

    repository.products.create.mockResolvedValue(PRODUCT)
    repository.variants.create.mockResolvedValue({})
    repository.modifierGroups.create.mockResolvedValue({ id: "g1" })
    repository.modifiers.create.mockResolvedValue({})
    repository.media.createUploadUrl.mockResolvedValue({
        object_key: "merchants/m1/products/p1/foto.jpg",
        upload_url: "https://storage.example/put",
        headers: {},
        expires_at: "2026-09-25T10:00:00+00:00",
    })
    repository.media.create.mockResolvedValue({})
    repository.productOutlets.replace.mockResolvedValue([])
    putToStorage.mockResolvedValue(undefined)
})

describe("useCreateProductBundle", () => {
    it("creates the product once and uploads media", async () => {
        const { result } = renderBundle()

        await act(async () => {
            result.current.start(buildInput())
        })

        await waitFor(() => expect(result.current.hasFailure).toBe(false))

        expect(repository.products.create).toHaveBeenCalledTimes(1)
        expect(putToStorage).toHaveBeenCalledTimes(1)
        expect(repository.media.create).toHaveBeenCalledTimes(1)
        expect(result.current.productId).toBe("p1")
        expect(result.current.steps.every((step) => step.status === "success" || step.status === "skipped")).toBe(true)
    })

    it("creates no variant for a simple product", async () => {
        const { result } = renderBundle()

        await act(async () => {
            result.current.start(buildInput(0))
        })

        await waitFor(() => expect(result.current.hasFailure).toBe(false))

        expect(repository.variants.create).not.toHaveBeenCalled()
    })

    it("retries only the failed step without recreating the product or re-uploading", async () => {
        repository.media.create.mockRejectedValueOnce(new Error("storage offline"))

        const { result } = renderBundle()

        await act(async () => {
            result.current.start(buildInput())
        })

        await waitFor(() => expect(result.current.hasFailure).toBe(true))

        expect(result.current.failedKeys).toEqual(["media"])
        expect(result.current.productId).toBe("p1")

        await act(async () => {
            result.current.retry()
        })

        await waitFor(() => expect(result.current.hasFailure).toBe(false))

        expect(repository.products.create).toHaveBeenCalledTimes(1)
        expect(putToStorage).toHaveBeenCalledTimes(1)
        expect(repository.media.create).toHaveBeenCalledTimes(2)
    })

    it("does not recreate variants or customization when a later step fails", async () => {
        repository.productOutlets.replace.mockRejectedValueOnce(new Error("outlet down"))

        const { result } = renderBundle()

        await act(async () => {
            result.current.start({
                ...buildInput(0),
                variants: [
                    { name: "Regular", price: 15000, is_default: true },
                    { name: "Jumbo", price: 20000, is_default: false },
                ],
                modifierGroups: [
                    {
                        group: {
                            name: "Pilihan Sambal",
                            selection_type: "single",
                            min_selection: 1,
                            max_selection: 1,
                            is_required: true,
                        },
                        modifiers: [{ name: "Sambal Mata", price: 2000, is_default: false }],
                    },
                ],
                outletIds: ["o1"],
            })
        })

        await waitFor(() => expect(result.current.hasFailure).toBe(true))

        expect(result.current.failedKeys).toEqual(["outlets"])
        expect(repository.variants.create).toHaveBeenCalledTimes(2)
        expect(repository.modifierGroups.create).toHaveBeenCalledTimes(1)
        expect(repository.modifiers.create).toHaveBeenCalledTimes(1)

        await act(async () => {
            result.current.retry()
        })

        await waitFor(() => expect(result.current.hasFailure).toBe(false))

        expect(repository.products.create).toHaveBeenCalledTimes(1)
        expect(repository.variants.create).toHaveBeenCalledTimes(2)
        expect(repository.modifierGroups.create).toHaveBeenCalledTimes(1)
        expect(repository.modifiers.create).toHaveBeenCalledTimes(1)
        expect(repository.productOutlets.replace).toHaveBeenCalledTimes(2)
    })
})
