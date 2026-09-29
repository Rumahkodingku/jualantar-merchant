import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useUpdateProductBundle } from "./use-update-product-bundle"
import type { EditPlan } from "./edit-plan.types"

const api = vi.hoisted(() => ({
    updateProduct: vi.fn(),
    updateProductVariant: vi.fn(),
    createProductVariant: vi.fn(),
    activateProductVariant: vi.fn(),
    deactivateProductVariant: vi.fn(),
    deleteProductVariant: vi.fn(),
    reorderProductVariants: vi.fn(),
    updateProductModifierGroup: vi.fn(),
    createProductModifierGroup: vi.fn(),
    deleteProductModifierGroup: vi.fn(),
    createProductModifier: vi.fn(),
    updateProductModifier: vi.fn(),
    deleteProductModifier: vi.fn(),
    reorderProductModifierGroups: vi.fn(),
    createProductMedia: vi.fn(),
    deleteProductMedia: vi.fn(),
    setPrimaryProductMedia: vi.fn(),
    reorderProductMedia: vi.fn(),
    replaceProductOutlets: vi.fn(),
}))

vi.mock("../products/product.api", () => ({ updateProduct: api.updateProduct }))
vi.mock("../variants/variant.api", () => ({
    updateProductVariant: api.updateProductVariant,
    createProductVariant: api.createProductVariant,
    activateProductVariant: api.activateProductVariant,
    deactivateProductVariant: api.deactivateProductVariant,
    deleteProductVariant: api.deleteProductVariant,
    reorderProductVariants: api.reorderProductVariants,
}))
vi.mock("../modifiers/modifier.api", () => ({
    updateProductModifierGroup: api.updateProductModifierGroup,
    createProductModifierGroup: api.createProductModifierGroup,
    deleteProductModifierGroup: api.deleteProductModifierGroup,
    createProductModifier: api.createProductModifier,
    updateProductModifier: api.updateProductModifier,
    deleteProductModifier: api.deleteProductModifier,
    reorderProductModifierGroups: api.reorderProductModifierGroups,
    activateProductModifierGroup: vi.fn(),
    deactivateProductModifierGroup: vi.fn(),
    activateProductModifier: vi.fn(),
    deactivateProductModifier: vi.fn(),
    reorderProductModifiers: vi.fn(),
}))
vi.mock("../media/media.api", () => ({
    createProductMedia: api.createProductMedia,
    deleteProductMedia: api.deleteProductMedia,
    setPrimaryProductMedia: api.setPrimaryProductMedia,
    reorderProductMedia: api.reorderProductMedia,
}))
vi.mock("../product-outlets/product-outlet.api", () => ({
    replaceProductOutlets: api.replaceProductOutlets,
}))

function plan(overrides: Partial<EditPlan> = {}): EditPlan {
    return {
        product: null,
        variants: { create: [], update: [], remove: [], reorder: null },
        customization: { groups: { create: [], update: [], remove: [], reorder: null } },
        media: { create: [], remove: [], primaryId: null, reorder: null },
        outlets: { replace: null },
        ...overrides,
    }
}

function renderBundle() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    return renderHook(() => useUpdateProductBundle("p1"), {
        wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    })
}

beforeEach(() => {
    vi.clearAllMocks()

    for (const mock of Object.values(api)) {
        mock.mockResolvedValue({})
    }

    api.createProductVariant.mockResolvedValue({ id: "v-new" })
    api.createProductModifierGroup.mockResolvedValue({ id: "g-new" })
})

describe("a step that has nothing to do is skipped, not called", () => {
    it("sends no request at all for a plan with nothing in it", async () => {
        const { result } = renderBundle()

        await act(async () => {
            result.current.start(plan())
        })

        await waitFor(() => expect(result.current.steps.every((step) => step.status === "skipped")).toBe(true))

        expect(api.updateProduct).not.toHaveBeenCalled()
        expect(api.replaceProductOutlets).not.toHaveBeenCalled()
    })

    it("still writes the parts that did change", async () => {
        const { result } = renderBundle()

        await act(async () => {
            result.current.start(
                plan({
                    product: { name: "Ayam Geprek", category_id: "c1", description: null, price: 18000 },
                    outlets: { replace: ["o1"] },
                })
            )
        })

        await waitFor(() => expect(result.current.hasFailure).toBe(false))

        expect(api.updateProduct).toHaveBeenCalledTimes(1)
        expect(api.replaceProductOutlets).toHaveBeenCalledWith("p1", ["o1"])
        expect(result.current.steps.find((step) => step.key === "variants")?.status).toBe("skipped")
    })
})

describe("removals are applied in an order that cannot take the wrong rows with them", () => {
    it("deletes a removed option before the group that was holding it", async () => {
        const { result } = renderBundle()

        await act(async () => {
            result.current.start(
                plan({
                    customization: {
                        groups: {
                            create: [],
                            update: [
                                {
                                    id: "g1",
                                    update: {},
                                    status: null,
                                    modifiers: { create: [], update: [], remove: ["m1"], reorder: null },
                                },
                            ],
                            remove: ["g1"],
                            reorder: null,
                        },
                    },
                })
            )
        })

        await waitFor(() => expect(result.current.hasFailure).toBe(false))

        const option = api.deleteProductModifier.mock.invocationCallOrder[0]
        const group = api.deleteProductModifierGroup.mock.invocationCallOrder[0]

        expect(api.deleteProductModifier).toHaveBeenCalledWith("p1", "g1", "m1")
        expect(api.deleteProductModifierGroup).toHaveBeenCalledWith("p1", "g1")
        expect(option).toBeLessThan(group)
    })

    it("reorders only after everything it reorders past has been removed", async () => {
        const { result } = renderBundle()

        await act(async () => {
            result.current.start(
                plan({
                    customization: {
                        groups: {
                            create: [],
                            update: [],
                            remove: ["g1"],
                            reorder: [{ id: "g2", display_order: 0 }],
                        },
                    },
                })
            )
        })

        await waitFor(() => expect(result.current.hasFailure).toBe(false))

        expect(api.reorderProductModifierGroups.mock.invocationCallOrder[0]).toBeGreaterThan(
            api.deleteProductModifierGroup.mock.invocationCallOrder[0]
        )
    })
})

describe("a status change goes through its own endpoint", () => {
    it("deactivates a variant whose status moved, without touching its fields", async () => {
        const { result } = renderBundle()

        await act(async () => {
            result.current.start(
                plan({
                    variants: {
                        create: [],
                        update: [{ id: "v1", update: {}, status: "inactive" }],
                        remove: [],
                        reorder: null,
                    },
                })
            )
        })

        await waitFor(() => expect(result.current.hasFailure).toBe(false))

        expect(api.deactivateProductVariant).toHaveBeenCalledWith("p1", "v1")
        expect(api.activateProductVariant).not.toHaveBeenCalled()
    })
})

describe("a retry resumes rather than starting the step again", () => {
    it("does not create a second copy of a row the first attempt already created", async () => {
        // The second photo fails, so the first has already been registered when
        // the step gives up.
        api.createProductMedia
            .mockResolvedValueOnce({})
            .mockRejectedValueOnce(new Error("storage offline"))
            .mockResolvedValue({})

        const { result } = renderBundle()

        await act(async () => {
            result.current.start(
                plan({
                    media: {
                        create: [
                            { object_key: "a.jpg", alt_text: null, is_primary: true, display_order: 0 },
                            { object_key: "b.jpg", alt_text: null, is_primary: false, display_order: 1 },
                        ],
                        remove: [],
                        primaryId: null,
                        reorder: null,
                    },
                })
            )
        })

        await waitFor(() => expect(result.current.hasFailure).toBe(true))

        expect(api.createProductMedia).toHaveBeenCalledTimes(2)

        await act(async () => {
            result.current.retry()
        })

        await waitFor(() => expect(result.current.hasFailure).toBe(false))

        // Three calls in total: two from the first attempt, one from the retry.
        // A fourth would mean the already-registered photo was registered again.
        expect(api.createProductMedia).toHaveBeenCalledTimes(3)
        expect(result.current.steps.every((step) => step.status === "success" || step.status === "skipped")).toBe(true)
    })

    it("does not re-run a step that already succeeded", async () => {
        api.replaceProductOutlets.mockRejectedValueOnce(new Error("offline"))

        const { result } = renderBundle()

        await act(async () => {
            result.current.start(
                plan({
                    product: { name: "Ayam Geprek", category_id: "c1", description: null, price: 18000 },
                    outlets: { replace: ["o1"] },
                })
            )
        })

        await waitFor(() => expect(result.current.hasFailure).toBe(true))

        await act(async () => {
            result.current.retry()
        })

        await waitFor(() => expect(result.current.hasFailure).toBe(false))

        expect(api.updateProduct).toHaveBeenCalledTimes(1)
        expect(api.replaceProductOutlets).toHaveBeenCalledTimes(2)
    })

    it("stops at the step that failed instead of pressing on", async () => {
        api.updateProductVariant.mockRejectedValue(new Error("conflict"))

        const { result } = renderBundle()

        await act(async () => {
            result.current.start(
                plan({
                    variants: {
                        create: [],
                        update: [{ id: "v1", update: { price: 1 }, status: null }],
                        remove: [],
                        reorder: null,
                    },
                    outlets: { replace: ["o1"] },
                })
            )
        })

        await waitFor(() => expect(result.current.hasFailure).toBe(true))

        // The outlet replace is the last step; it must not have run behind a
        // failure the merchant has not seen yet.
        expect(api.replaceProductOutlets).not.toHaveBeenCalled()
        expect(result.current.steps.find((step) => step.key === "outlets")?.status).toBe("pending")
    })
})
