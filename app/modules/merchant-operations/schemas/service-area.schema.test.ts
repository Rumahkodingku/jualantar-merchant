import { describe, expect, it } from "vitest"

import { serviceAreaSchema } from "./service-area.schema"

describe("serviceAreaSchema", () => {
    it("accepts a radius within the API bounds", () => {
        expect(serviceAreaSchema.safeParse({ type: "radius", radius_km: 10 }).success).toBe(true)
    })

    it("requires radius_km for a radius area", () => {
        expect(serviceAreaSchema.safeParse({ type: "radius" }).success).toBe(false)
        expect(serviceAreaSchema.safeParse({ type: "radius", radius_km: "" }).success).toBe(false)
    })

    it("rejects a radius outside 0.1 - 999.99", () => {
        expect(serviceAreaSchema.safeParse({ type: "radius", radius_km: 0 }).success).toBe(false)
        expect(serviceAreaSchema.safeParse({ type: "radius", radius_km: 1000 }).success).toBe(false)
    })

    it("accepts a region level without a radius", () => {
        expect(serviceAreaSchema.safeParse({ type: "regency" }).success).toBe(true)
    })

    it("rejects an unknown type", () => {
        expect(serviceAreaSchema.safeParse({ type: "country" }).success).toBe(false)
    })
})
