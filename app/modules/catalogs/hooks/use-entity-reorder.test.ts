import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { useEntityReorder } from "./use-entity-reorder"

const ITEMS = [{ id: "a" }, { id: "b" }, { id: "c" }]

describe("useEntityReorder", () => {
    it("moves an item down and resequences display_order", () => {
        const reorder = vi.fn()
        const { result } = renderHook(() => useEntityReorder({ items: ITEMS, reorder }))

        result.current.move(0, 1)

        expect(reorder).toHaveBeenCalledWith(
            [
                { id: "b", display_order: 0 },
                { id: "a", display_order: 1 },
                { id: "c", display_order: 2 },
            ],
            { onError: expect.any(Function) }
        )
    })

    it("moves an item up", () => {
        const reorder = vi.fn()
        const { result } = renderHook(() => useEntityReorder({ items: ITEMS, reorder }))

        result.current.move(2, -1)

        expect(reorder).toHaveBeenCalledWith(
            [
                { id: "a", display_order: 0 },
                { id: "c", display_order: 1 },
                { id: "b", display_order: 2 },
            ],
            { onError: expect.any(Function) }
        )
    })

    it("does nothing when the move would fall outside the list", () => {
        const reorder = vi.fn()
        const { result } = renderHook(() => useEntityReorder({ items: ITEMS, reorder }))

        result.current.move(0, -1)
        result.current.move(2, 1)

        expect(reorder).not.toHaveBeenCalled()
    })
})
