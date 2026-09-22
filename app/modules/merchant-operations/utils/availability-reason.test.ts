import { describe, expect, it } from "vitest"

import { availabilityPresentation, availabilityReasonMessage } from "./availability-reason"

describe("availabilityPresentation", () => {
    it("maps open/closed to a readable label", () => {
        expect(availabilityPresentation("open").label).toBe("Buka")
        expect(availabilityPresentation("open").headline).toBe("Siap menerima pesanan")
        expect(availabilityPresentation("closed").label).toBe("Tutup")
    })
})

describe("availabilityReasonMessage", () => {
    it("explains every documented reason code", () => {
        expect(availabilityReasonMessage("merchant_inactive")).toContain("Merchant")
        expect(availabilityReasonMessage("merchant_suspended")).toContain("ditangguhkan")
        expect(availabilityReasonMessage("outlet_inactive")).toContain("Outlet")
        expect(availabilityReasonMessage("outside_operating_hours")).toContain("jam operasional")
        expect(availabilityReasonMessage("scheduled_closed")).toContain("tutup")
    })

    it("returns null when the outlet is open", () => {
        expect(availabilityReasonMessage(null)).toBeNull()
    })
})
