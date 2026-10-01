import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useOutletProducts } from "./outlet-catalog.queries"
import type { OutletCatalogItem } from "../../types"

const { fetchOutletProducts } = vi.hoisted(() => ({ fetchOutletProducts: vi.fn() }))

vi.mock("./outlet-catalog.api", async (importOriginal) => {
    const actual = await importOriginal<typeof import("./outlet-catalog.api")>()

    return { ...actual, fetchOutletProducts }
})

function itemFor(outletId: string): OutletCatalogItem {
    return {
        product: {
            id: `${outletId}-product`,
            name: `Produk ${outletId}`,
            description: null,
            product_type: "simple",
            price: 1000,
            status: "active",
        },
        category: null,
        variants: [],
        primary_media: null,
        modifier_groups: [],
        assignment: {
            id: `${outletId}-assignment`,
            status: "active",
            availability_status: "available",
            unavailable_reason: null,
            display_order: 0,
        },
        is_sellable: true,
    }
}

function wrapperFor(queryClient: QueryClient) {
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}

beforeEach(() => {
    fetchOutletProducts.mockReset()
    fetchOutletProducts.mockImplementation((outletId: string) =>
        Promise.resolve({
            data: [itemFor(outletId)],
            meta: { current_page: 1, per_page: 100, total: 1, last_page: 1 },
        })
    )
})

describe("useOutletProducts", () => {
    it("never serves outlet A's data when the outlet switches to B", async () => {
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

        const { result, rerender } = renderHook(({ outletId }) => useOutletProducts(outletId), {
            wrapper: wrapperFor(queryClient),
            initialProps: { outletId: "A" },
        })

        await waitFor(() => expect(result.current.data?.data[0]?.product.id).toBe("A-product"))

        rerender({ outletId: "B" })

        await waitFor(() => expect(result.current.data?.data[0]?.product.id).toBe("B-product"))
        expect(fetchOutletProducts).toHaveBeenCalledWith("B", expect.anything())
    })

    it("keeps separate cache entries per outlet", async () => {
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

        const a = renderHook(() => useOutletProducts("A"), { wrapper: wrapperFor(queryClient) })
        await waitFor(() => expect(a.result.current.data?.data[0]?.product.id).toBe("A-product"))

        const b = renderHook(() => useOutletProducts("B"), { wrapper: wrapperFor(queryClient) })
        await waitFor(() => expect(b.result.current.data?.data[0]?.product.id).toBe("B-product"))

        // Re-mounting A must come from A's own cache, not B's.
        const aAgain = renderHook(() => useOutletProducts("A"), { wrapper: wrapperFor(queryClient) })
        expect(aAgain.result.current.data?.data[0]?.product.id).toBe("A-product")
    })
})
