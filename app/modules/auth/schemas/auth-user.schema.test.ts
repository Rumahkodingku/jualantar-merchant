import { describe, expect, it } from "vitest"

import { normalizeAuthUser, normalizeOutletAssignments } from "./auth-user.schema"

describe("normalizeOutletAssignments", () => {
    it("maps snake_case assignments to camelCase", () => {
        expect(
            normalizeOutletAssignments([
                { outlet_id: "A", role: "outlet_manager" },
                { outlet_id: "B", role: "outlet_staff" },
            ])
        ).toEqual([
            { outletId: "A", role: "outlet_manager" },
            { outletId: "B", role: "outlet_staff" },
        ])
    })

    it("drops entries with an unknown role (fail-closed)", () => {
        expect(normalizeOutletAssignments([{ outlet_id: "A", role: "owner" }])).toEqual([])
    })

    it("drops malformed entries", () => {
        expect(normalizeOutletAssignments([{ role: "outlet_manager" }, null, "nope"])).toEqual([])
    })

    it("returns an empty list for non-array input", () => {
        expect(normalizeOutletAssignments(undefined)).toEqual([])
        expect(normalizeOutletAssignments(null)).toEqual([])
        expect(normalizeOutletAssignments({ outlet_id: "A" })).toEqual([])
    })
})

describe("normalizeAuthUser", () => {
    it("maps the full payload to the UI model", () => {
        const result = normalizeAuthUser({
            id: "user-1",
            email: "user@example.com",
            roles: ["merchant"],
            permissions: ["merchant.operations.view"],
            outlet_assignments: [{ outlet_id: "A", role: "outlet_manager" }],
            created_at: "2026-01-01T00:00:00Z",
            updated_at: null,
        })

        expect(result).toEqual({
            id: "user-1",
            email: "user@example.com",
            roles: ["merchant"],
            permissions: ["merchant.operations.view"],
            outletAssignments: [{ outletId: "A", role: "outlet_manager" }],
            created_at: "2026-01-01T00:00:00Z",
            updated_at: null,
        })
    })

    it("defaults missing collections to empty arrays (no outlet access)", () => {
        const result = normalizeAuthUser({ id: "user-1", email: "u@e.c" })

        expect(result.roles).toEqual([])
        expect(result.permissions).toEqual([])
        expect(result.outletAssignments).toEqual([])
        expect(result.created_at).toBeNull()
        expect(result.updated_at).toBeNull()
    })

    it("throws when the required identity fields are absent", () => {
        expect(() => normalizeAuthUser({ email: "u@e.c" })).toThrow()
    })
})
