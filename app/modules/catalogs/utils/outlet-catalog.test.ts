import { describe, expect, it } from "vitest"

import { ApiError } from "~/lib/api"

import { deriveOutletSelection, resolveOutletCatalogState, selectedOutletId } from "./outlet-catalog"

describe("deriveOutletSelection", () => {
    it("returns none when the user has no outlet in scope", () => {
        expect(deriveOutletSelection([], null)).toEqual({ type: "none" })
    })

    it("auto-selects a single outlet", () => {
        expect(deriveOutletSelection(["A"], null)).toEqual({ type: "single", outletId: "A" })
    })

    it("uses the URL selection when it is valid", () => {
        expect(deriveOutletSelection(["A", "B"], "B")).toEqual({ type: "selected", outletId: "B" })
    })

    it("requires an explicit pick when multiple outlets and none is valid", () => {
        expect(deriveOutletSelection(["A", "B"], null)).toEqual({ type: "unselected" })
        expect(deriveOutletSelection(["A", "B"], "C")).toEqual({ type: "unselected" })
    })
})

describe("selectedOutletId", () => {
    it("resolves the id for single/selected and undefined otherwise", () => {
        expect(selectedOutletId({ type: "single", outletId: "A" })).toBe("A")
        expect(selectedOutletId({ type: "selected", outletId: "B" })).toBe("B")
        expect(selectedOutletId({ type: "none" })).toBeUndefined()
        expect(selectedOutletId({ type: "unselected" })).toBeUndefined()
    })
})

describe("resolveOutletCatalogState", () => {
    it("distinguishes 403 from 404", () => {
        expect(
            resolveOutletCatalogState(
                new ApiError({ status: 403, code: "outlet_scope_forbidden", title: "Forbidden", detail: "" })
            )
        ).toBe("forbidden")
        expect(
            resolveOutletCatalogState(
                new ApiError({ status: 404, code: "outlet_not_found", title: "Not Found", detail: "" })
            )
        ).toBe("not-found")
    })

    it("falls back to a generic error for anything else", () => {
        expect(
            resolveOutletCatalogState(new ApiError({ status: 500, code: "server_error", title: "Error", detail: "" }))
        ).toBe("error")
        expect(resolveOutletCatalogState(new Error("boom"))).toBe("error")
    })
})
