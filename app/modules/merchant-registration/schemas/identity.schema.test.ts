import { describe, expect, it } from "vitest"

import { identitySchema } from "./identity.schema"

const baseIdentity = {
    id_type: "ktp" as const,
    id_number: "6101",
    full_name: "Budi",
    birth_date: "",
}

describe("identitySchema", () => {
    it("accepts a valid identity without birth date", () => {
        expect(identitySchema.safeParse(baseIdentity).success).toBe(true)
    })

    it("rejects a future birth date", () => {
        const future = new Date()
        future.setFullYear(future.getFullYear() + 1)

        const result = identitySchema.safeParse({
            ...baseIdentity,
            birth_date: future.toISOString().slice(0, 10),
        })

        expect(result.success).toBe(false)
    })

    it("accepts a past birth date", () => {
        const result = identitySchema.safeParse({
            ...baseIdentity,
            birth_date: "1999-01-01",
        })

        expect(result.success).toBe(true)
    })

    it("requires an id number and full name", () => {
        const result = identitySchema.safeParse({
            ...baseIdentity,
            id_number: "",
            full_name: "",
        })

        expect(result.success).toBe(false)
    })
})
