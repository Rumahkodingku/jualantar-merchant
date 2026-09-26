import { describe, expect, it } from "vitest"

import { modifierGroupSchema } from "./catalog.schema"

const base = {
    name: "Level Pedas",
    description: "",
    selection_type: "multiple",
    min_selection: 0,
    max_selection_raw: "",
    is_required: false,
}

function issuePaths(input: Record<string, unknown>): string[] {
    const parsed = modifierGroupSchema.safeParse(input)

    return parsed.success ? [] : parsed.error.issues.map((issue) => issue.path.join("."))
}

describe("modifierGroupSchema", () => {
    it("keeps an empty max as unlimited for a multiple group", () => {
        const parsed = modifierGroupSchema.safeParse(base)

        expect(parsed.success).toBe(true)
        expect(parsed.success && parsed.data.max_selection_raw).toBe("")
    })

    it("rejects a zero max for a multiple group with an empty min", () => {
        expect(issuePaths({ ...base, max_selection_raw: 0 })).toContain("max_selection_raw")
    })

    it("rejects a max below max(min, 1)", () => {
        expect(issuePaths({ ...base, min_selection: 2, is_required: true, max_selection_raw: 1 })).toContain(
            "max_selection_raw"
        )
    })

    it("accepts a max above the lower bound", () => {
        const parsed = modifierGroupSchema.safeParse({ ...base, max_selection_raw: 3 })

        expect(parsed.success).toBe(true)
        expect(parsed.success && parsed.data.max_selection_raw).toBe(3)
    })

    it("rejects a decimal max", () => {
        expect(issuePaths({ ...base, max_selection_raw: 1.5 })).toContain("max_selection_raw")
    })

    it("rejects a single group whose max is not one", () => {
        expect(issuePaths({ ...base, selection_type: "single", max_selection_raw: 2 })).toContain("max_selection_raw")
    })

    it("accepts a single group without an explicit max", () => {
        expect(issuePaths({ ...base, selection_type: "single" })).toEqual([])
    })

    it("requires is_required to follow the min selection", () => {
        expect(issuePaths({ ...base, min_selection: 1, is_required: false })).toContain("is_required")
        expect(issuePaths({ ...base, min_selection: 0, is_required: true })).toContain("is_required")
    })

    it("accepts is_required matching a min of one", () => {
        expect(issuePaths({ ...base, min_selection: 1, is_required: true })).toEqual([])
    })

    it("requires a min of zero when the group is optional", () => {
        expect(issuePaths({ ...base, min_selection: 2, is_required: false })).toContain("is_required")
    })

    it("caps the min selection of a single group at one", () => {
        expect(issuePaths({ ...base, selection_type: "single", min_selection: 2, is_required: true })).toContain(
            "is_required"
        )
    })

    it("accepts an optional single group", () => {
        expect(issuePaths({ ...base, selection_type: "single", min_selection: 0, is_required: false })).toEqual([])
    })

    it("accepts a required single group", () => {
        expect(issuePaths({ ...base, selection_type: "single", min_selection: 1, is_required: true })).toEqual([])
    })

    it("requires a name", () => {
        expect(issuePaths({ ...base, name: "   " })).toContain("name")
    })
})
