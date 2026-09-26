import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useCreateProductBundle, type BundleProgress, type ProductBundleInput } from "./product-bundle.mutation"

const { repository } = vi.hoisted(() => ({
    repository: {
        products: { create: vi.fn() },
        variants: { create: vi.fn() },
        modifierGroups: { create: vi.fn() },
        modifiers: { create: vi.fn() },
        media: { create: vi.fn() },
        productOutlets: { replace: vi.fn() },
    },
}))

vi.mock("../catalog.repository", () => ({ catalogRepository: repository }))

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
            object_key: `merchants/m1/drafts/foto-${index}.jpg`,
            alt_text: null,
            is_primary: index === 0,
        })),
        outletIds: [],
    }
}

function renderBundle(initialProgress?: BundleProgress) {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    return renderHook(() => useCreateProductBundle(initialProgress), {
        wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    })
}

beforeEach(() => {
    vi.clearAllMocks()

    repository.products.create.mockResolvedValue(PRODUCT)
    repository.variants.create.mockResolvedValue({})
    repository.modifierGroups.create.mockResolvedValue({ id: "g1" })
    repository.modifiers.create.mockResolvedValue({})
    repository.media.create.mockResolvedValue({})
    repository.productOutlets.replace.mockResolvedValue([])
})

describe("useCreateProductBundle", () => {
    it("creates the product once and registers the staged photos", async () => {
        const { result } = renderBundle()

        await act(async () => {
            result.current.start(buildInput())
        })

        await waitFor(() => expect(result.current.hasFailure).toBe(false))

        expect(repository.products.create).toHaveBeenCalledTimes(1)
        expect(repository.media.create).toHaveBeenCalledTimes(1)
        expect(repository.media.create).toHaveBeenCalledWith("p1", {
            object_key: "merchants/m1/drafts/foto-0.jpg",
            is_primary: true,
            alt_text: null,
        })
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

    it("retries only the failed step without recreating the product", async () => {
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

    it("resumes an interrupted create without duplicating anything", async () => {
        repository.productOutlets.replace.mockRejectedValueOnce(new Error("outlet down"))

        const input: ProductBundleInput = {
            ...buildInput(2),
            variants: [
                { name: "Regular", price: 15000, is_default: true },
                { name: "Jumbo", price: 20000, is_default: false },
            ],
            outletIds: ["o1"],
        }
        const first = renderBundle()

        await act(async () => {
            first.result.current.start(input)
        })

        await waitFor(() => expect(first.result.current.failedKeys).toEqual(["outlets"]))

        const saved = first.result.current.progress()

        expect(saved).toEqual({
            productId: "p1",
            createdVariants: 2,
            createdGroupIds: [],
            createdModifierCounts: [],
            createdMedia: 2,
            outletsReplaced: false,
        })

        // A reload rebuilds the hook from the persisted cursors: three steps read
        // as done and only the outlets call is still owed.
        const resumed = renderBundle(saved)

        expect(resumed.result.current.productId).toBe("p1")
        expect(resumed.result.current.steps.filter((step) => step.status === "success").map((s) => s.key)).toEqual([
            "product",
            "variants",
            "media",
        ])

        await act(async () => {
            resumed.result.current.retry(input)
        })

        await waitFor(() => expect(resumed.result.current.hasFailure).toBe(false))

        expect(repository.products.create).toHaveBeenCalledTimes(1)
        expect(repository.variants.create).toHaveBeenCalledTimes(2)
        expect(repository.media.create).toHaveBeenCalledTimes(2)
        expect(repository.productOutlets.replace).toHaveBeenCalledTimes(2)
    })

    it("does not re-create modifier groups a restored cursor already covered", async () => {
        repository.productOutlets.replace.mockRejectedValueOnce(new Error("outlet down"))

        const input: ProductBundleInput = {
            ...buildInput(0),
            modifierGroups: [
                {
                    group: {
                        name: "Pilihan Sambal",
                        selection_type: "single",
                        min_selection: 1,
                        max_selection: 1,
                        is_required: true,
                    },
                    modifiers: [
                        { name: "Sambal Mata", price: 2000, is_default: false },
                        { name: "Sambal Bawang", price: 2000, is_default: false },
                    ],
                },
            ],
            outletIds: ["o1"],
        }
        const first = renderBundle()

        await act(async () => {
            first.result.current.start(input)
        })

        await waitFor(() => expect(first.result.current.failedKeys).toEqual(["outlets"]))

        const saved = first.result.current.progress()

        expect(saved.createdGroupIds).toEqual(["g1"])
        expect(saved.createdModifierCounts).toEqual([2])

        const resumed = renderBundle(saved)

        await act(async () => {
            resumed.result.current.retry(input)
        })

        await waitFor(() => expect(resumed.result.current.hasFailure).toBe(false))

        expect(repository.modifierGroups.create).toHaveBeenCalledTimes(1)
        expect(repository.modifiers.create).toHaveBeenCalledTimes(2)
        expect(repository.productOutlets.replace).toHaveBeenCalledTimes(2)
    })

    it("skips a step that has nothing to do when retrying an empty form", async () => {
        const { result } = renderBundle({
            productId: "p1",
            createdVariants: 0,
            createdGroupIds: [],
            createdModifierCounts: [],
            createdMedia: 0,
            outletsReplaced: true,
        })

        await act(async () => {
            result.current.retry(buildInput(0))
        })

        expect(result.current.steps.every((step) => step.status === "skipped" || step.status === "success")).toBe(true)
        expect(repository.products.create).not.toHaveBeenCalled()
        expect(repository.productOutlets.replace).not.toHaveBeenCalled()
    })
})
