import { describe, expect, it } from "vitest"

import { merchantStatusPresentation } from "./merchant-status"

describe("merchantStatusPresentation", () => {
    it("only offers valid transitions for the current status", () => {
        expect(merchantStatusPresentation("inactive").actions).toEqual(["activate"])
        expect(merchantStatusPresentation("active").actions).toEqual(["suspend"])
        expect(merchantStatusPresentation("suspended").actions).toEqual(["reactivate"])
    })

    it("describes the operational impact of each status", () => {
        expect(merchantStatusPresentation("active").tone).toBe("positive")
        expect(merchantStatusPresentation("inactive").tone).toBe("neutral")
        expect(merchantStatusPresentation("suspended").tone).toBe("negative")
        expect(merchantStatusPresentation("suspended").description).toContain("berhenti menerima pesanan")
    })
})
