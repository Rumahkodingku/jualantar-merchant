import { describe, expect, it } from "vitest"

import type { AuthUser } from "~/modules/auth"

import { CAP } from "./capabilities"
import { can, canForOutlet, canViewOutletList, isMerchantOwner, roleForOutlet } from "./resolver"

function makeUser(overrides: Partial<AuthUser> = {}): AuthUser {
    return {
        id: "user-1",
        email: "user@example.com",
        roles: [],
        permissions: [],
        outletAssignments: [],
        created_at: null,
        updated_at: null,
        ...overrides,
    }
}

/** Budi: outlet A → manager, outlet B → staff, no global permissions. */
const multiOutlet = makeUser({
    outletAssignments: [
        { outletId: "A", role: "outlet_manager" },
        { outletId: "B", role: "outlet_staff" },
    ],
})

/** Merchant owner: global `merchant` role holds every capability. */
const owner = makeUser({
    roles: ["merchant"],
    permissions: [
        CAP.view,
        CAP.outletsView,
        CAP.outletsCreate,
        CAP.outletsStatusUpdate,
        CAP.hoursView,
        CAP.hoursUpdate,
    ],
})

describe("roleForOutlet", () => {
    it("resolves the role for an assigned outlet only", () => {
        expect(roleForOutlet(multiOutlet, "A")).toBe("outlet_manager")
        expect(roleForOutlet(multiOutlet, "B")).toBe("outlet_staff")
        expect(roleForOutlet(multiOutlet, "C")).toBeNull()
    })

    it("returns null without a user or outlet id", () => {
        expect(roleForOutlet(null, "A")).toBeNull()
        expect(roleForOutlet(multiOutlet, undefined)).toBeNull()
    })
})

describe("can / isMerchantOwner", () => {
    it("only reads global permissions for global capability", () => {
        expect(can(owner, CAP.hoursUpdate)).toBe(true)
        expect(can(multiOutlet, CAP.hoursUpdate)).toBe(false)
        expect(can(null, CAP.hoursUpdate)).toBe(false)
    })

    it("detects the merchant owner from the global role", () => {
        expect(isMerchantOwner(owner)).toBe(true)
        expect(isMerchantOwner(multiOutlet)).toBe(false)
    })
})

describe("canForOutlet", () => {
    it("uses the outlet role capability map (manager)", () => {
        expect(canForOutlet(multiOutlet, "A", CAP.hoursView)).toBe(true)
        expect(canForOutlet(multiOutlet, "A", CAP.hoursUpdate)).toBe(true)
        expect(canForOutlet(multiOutlet, "A", CAP.outletsUpdate)).toBe(true)
        expect(canForOutlet(multiOutlet, "A", CAP.outletUsersAssign)).toBe(true)
    })

    it("uses the outlet role capability map (staff)", () => {
        expect(canForOutlet(multiOutlet, "B", CAP.hoursView)).toBe(true)
        expect(canForOutlet(multiOutlet, "B", CAP.hoursUpdate)).toBe(false)
        expect(canForOutlet(multiOutlet, "B", CAP.outletsUpdate)).toBe(false)
        expect(canForOutlet(multiOutlet, "B", CAP.outletUsersAssign)).toBe(false)
        expect(canForOutlet(multiOutlet, "B", CAP.outletsStatusUpdate)).toBe(false)
    })

    it("never mixes assignments between outlets", () => {
        expect(canForOutlet(multiOutlet, "A", CAP.hoursUpdate)).toBe(true)
        expect(canForOutlet(multiOutlet, "B", CAP.hoursUpdate)).toBe(false)
    })

    it("denies unknown outlets and missing sessions", () => {
        expect(canForOutlet(multiOutlet, "C", CAP.hoursView)).toBe(false)
        expect(canForOutlet(null, "A", CAP.hoursView)).toBe(false)
        expect(canForOutlet(multiOutlet, undefined, CAP.hoursView)).toBe(false)
    })

    it("honours the explicit owner bypass via global permissions", () => {
        expect(canForOutlet(owner, "any-outlet", CAP.hoursUpdate)).toBe(true)
        expect(canForOutlet(owner, "any-outlet", CAP.outletsStatusUpdate)).toBe(true)
    })
})

describe("canViewOutletList", () => {
    it("allows owners and assigned users, denies users without access", () => {
        expect(canViewOutletList(owner)).toBe(true)
        expect(canViewOutletList(multiOutlet)).toBe(true)
        expect(canViewOutletList(makeUser())).toBe(false)
        expect(canViewOutletList(null)).toBe(false)
    })

    it("treats a global outlets.view grant as list access", () => {
        expect(canViewOutletList(makeUser({ permissions: [CAP.outletsView] }))).toBe(true)
    })
})
