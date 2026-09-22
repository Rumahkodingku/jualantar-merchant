import { describe, expect, it } from "vitest"

import { employeePayload, employeeSchema } from "./employee.schema"

const base = {
    email: "karyawan@usaha.id",
    phone: "",
    password: "password123",
    password_confirmation: "password123",
    role: "outlet_staff" as const,
}

describe("employeeSchema", () => {
    it("accepts a valid employee payload", () => {
        expect(employeeSchema.safeParse(base).success).toBe(true)
    })

    it("rejects a mismatched confirmation", () => {
        const result = employeeSchema.safeParse({ ...base, password_confirmation: "lain1234" })

        expect(result.success).toBe(false)
    })

    it("requires letters and numbers in the password, mirroring the API rule", () => {
        expect(
            employeeSchema.safeParse({ ...base, password: "abcdefgh", password_confirmation: "abcdefgh" }).success
        ).toBe(false)
        expect(
            employeeSchema.safeParse({ ...base, password: "12345678", password_confirmation: "12345678" }).success
        ).toBe(false)
    })

    it("only allows outlet roles", () => {
        expect(employeeSchema.safeParse({ ...base, role: "owner" }).success).toBe(false)
    })

    it("rejects an invalid email", () => {
        expect(employeeSchema.safeParse({ ...base, email: "bukan-email" }).success).toBe(false)
    })
})

describe("employeePayload", () => {
    it("converts an empty phone to null", () => {
        const values = employeeSchema.parse(base)

        expect(employeePayload(values).phone).toBeNull()
    })

    it("trims the email", () => {
        const values = employeeSchema.parse({ ...base, email: "  karyawan@usaha.id " })

        expect(employeePayload(values).email).toBe("karyawan@usaha.id")
    })
})
