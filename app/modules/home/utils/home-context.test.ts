import { describe, expect, it } from "vitest"

import { deriveHomeContext } from "./home-context"

describe("deriveHomeContext", () => {
    it("returns none when there are no outlets", () => {
        expect(deriveHomeContext([], null)).toEqual({ type: "none" })
        expect(deriveHomeContext([], "o1")).toEqual({ type: "none" })
    })

    it("returns single when there is exactly one outlet", () => {
        expect(deriveHomeContext(["o1"], null)).toEqual({ type: "single", outletId: "o1" })
    })

    it("ignores the selected id when there is exactly one outlet", () => {
        expect(deriveHomeContext(["o1"], "o9")).toEqual({ type: "single", outletId: "o1" })
    })

    it("returns all by default for multiple outlets", () => {
        expect(deriveHomeContext(["o1", "o2"], null)).toEqual({ type: "all", outletIds: ["o1", "o2"] })
    })

    it("returns selected when the selected id exists", () => {
        expect(deriveHomeContext(["o1", "o2", "o3"], "o2")).toEqual({
            type: "selected",
            outletId: "o2",
            outletIds: ["o1", "o2", "o3"],
        })
    })

    it("falls back to all when the selected id is unknown", () => {
        expect(deriveHomeContext(["o1", "o2"], "o9")).toEqual({ type: "all", outletIds: ["o1", "o2"] })
    })
})
