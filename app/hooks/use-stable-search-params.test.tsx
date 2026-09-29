import { renderHook } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import type { ReactNode } from "react"
import { describe, expect, it, vi } from "vitest"

const { setSearchParams } = vi.hoisted(() => ({ setSearchParams: vi.fn() }))

vi.mock("react-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("react-router")>()

    return {
        ...actual,
        useSearchParams: () => [new URLSearchParams("tab=ringkasan"), setSearchParams],
    }
})

import { useStableSearchParams } from "./use-stable-search-params"

function wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter>{children}</MemoryRouter>
}

describe("useStableSearchParams", () => {
    it("returns the current search params", () => {
        const { result } = renderHook(() => useStableSearchParams(), { wrapper })

        expect(result.current[0].get("tab")).toBe("ringkasan")
    })

    it("forces preventScrollReset so the page is not scrolled to top", () => {
        const { result } = renderHook(() => useStableSearchParams(), { wrapper })

        result.current[1](new URLSearchParams("tab=media"), { replace: true })

        expect(setSearchParams).toHaveBeenCalledWith(expect.any(URLSearchParams), {
            replace: true,
            preventScrollReset: true,
        })
    })

    it("applies preventScrollReset even without navigate options", () => {
        const { result } = renderHook(() => useStableSearchParams(), { wrapper })

        result.current[1]({ tab: "outlet" })

        expect(setSearchParams).toHaveBeenCalledWith(expect.anything(), { preventScrollReset: true })
    })
})
