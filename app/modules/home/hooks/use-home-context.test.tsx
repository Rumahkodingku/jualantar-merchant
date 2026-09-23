import { renderHook } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

const fixtures = vi.hoisted(() => ({
    outlets: [] as { id: string; name: string }[],
    total: 0,
}))

vi.mock("~/modules/merchant-operations", () => ({
    useOperationalOutlets: () => ({
        data: {
            data: fixtures.outlets,
            meta: { current_page: 1, per_page: 50, total: fixtures.total, last_page: 1 },
        },
        isPending: false,
        isError: false,
        error: null,
        refetch: vi.fn(),
    }),
}))

import { useHomeContext } from "./use-home-context"

function wrapper(initialEntry: string) {
    return function Wrapper({ children }: { children: ReactNode }) {
        return <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
    }
}

describe("useHomeContext", () => {
    it("derives none for zero outlets", () => {
        fixtures.outlets = []
        fixtures.total = 0

        const { result } = renderHook(() => useHomeContext(), { wrapper: wrapper("/") })

        expect(result.current.context).toEqual({ type: "none" })
        expect(result.current.outletTotal).toBe(0)
    })

    it("derives single for one outlet", () => {
        fixtures.outlets = [{ id: "o1", name: "Outlet 1" }]
        fixtures.total = 1

        const { result } = renderHook(() => useHomeContext(), { wrapper: wrapper("/") })

        expect(result.current.context).toEqual({ type: "single", outletId: "o1" })
    })

    it("derives all by default and selected from the URL param", () => {
        fixtures.outlets = [
            { id: "o1", name: "Outlet 1" },
            { id: "o2", name: "Outlet 2" },
        ]
        fixtures.total = 2

        const { result: all } = renderHook(() => useHomeContext(), { wrapper: wrapper("/") })
        expect(all.current.context).toEqual({ type: "all", outletIds: ["o1", "o2"] })

        const { result: selected } = renderHook(() => useHomeContext(), { wrapper: wrapper("/?outlet=o2") })
        expect(selected.current.context).toEqual({ type: "selected", outletId: "o2", outletIds: ["o1", "o2"] })
        expect(selected.current.selectedOutlet?.id).toBe("o2")
    })

    it("falls back to all for an unknown outlet param", () => {
        fixtures.outlets = [
            { id: "o1", name: "Outlet 1" },
            { id: "o2", name: "Outlet 2" },
        ]
        fixtures.total = 2

        const { result } = renderHook(() => useHomeContext(), { wrapper: wrapper("/?outlet=unknown") })

        expect(result.current.context).toEqual({ type: "all", outletIds: ["o1", "o2"] })
    })

    it("flags hasMoreOutlets when the total exceeds the fetched list", () => {
        fixtures.outlets = [{ id: "o1", name: "Outlet 1" }]
        fixtures.total = 60

        const { result } = renderHook(() => useHomeContext(), { wrapper: wrapper("/") })

        expect(result.current.hasMoreOutlets).toBe(true)
    })
})
