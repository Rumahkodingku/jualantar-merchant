import { describe, expect, it } from "vitest"

import { registerSchema } from "./register.schema"

const baseValues = {
    full_name: "Merchant Owner",
    email: "merchant@example.com",
    phone: "081234567890",
    password: "secret123",
    password_confirmation: "secret123",
    terms_accepted: true,
}

describe("registerSchema", () => {
    it("accepts a complete valid registration", () => {
        expect(registerSchema.safeParse(baseValues).success).toBe(true)
    })

    it("requires accepted terms", () => {
        const result = registerSchema.safeParse({ ...baseValues, terms_accepted: false })

        expect(result.success).toBe(false)

        if (!result.success) {
            expect(result.error.issues.some((issue) => issue.path[0] === "terms_accepted")).toBe(true)
        }
    })

    it("rejects a weak password", () => {
        expect(
            registerSchema.safeParse({ ...baseValues, password: "short", password_confirmation: "short" }).success
        ).toBe(false)
        expect(
            registerSchema.safeParse({
                ...baseValues,
                password: "onlyletters",
                password_confirmation: "onlyletters",
            }).success
        ).toBe(false)
    })

    it("rejects mismatched password confirmation", () => {
        const result = registerSchema.safeParse({
            ...baseValues,
            password_confirmation: "different123",
        })

        expect(result.success).toBe(false)

        if (!result.success) {
            expect(result.error.issues.some((issue) => issue.path[0] === "password_confirmation")).toBe(true)
        }
    })

    it("rejects an invalid phone number", () => {
        expect(registerSchema.safeParse({ ...baseValues, phone: "12345" }).success).toBe(false)
    })
})
