import { describe, expect, it } from "vitest"

import { ApiError } from "~/lib/api"

import { applyServerFieldErrors, firstServerFieldError } from "./api-error"

function validationError(errors: Record<string, string[]>): ApiError {
    return new ApiError({
        status: 422,
        code: "validation",
        title: "Validasi gagal",
        detail: "Data tidak valid.",
        errors,
    })
}

describe("applyServerFieldErrors", () => {
    it("maps a server field onto the form field that renders it", () => {
        const error = validationError({ max_selection: ["The max selection must be at least 1."] })

        expect(
            applyServerFieldErrors(error, ["name", "max_selection"], { max_selection: "max_selection_raw" })
        ).toEqual({ max_selection_raw: "The max selection must be at least 1." })
    })

    it("keeps the server field name when no mapping is given", () => {
        const error = validationError({ name: ["The name field is required."] })

        expect(applyServerFieldErrors(error, ["name", "description"])).toEqual({
            name: "The name field is required.",
        })
    })

    it("ignores fields the form does not render", () => {
        const error = validationError({ selection_type: ["Unknown selection type."] })

        expect(applyServerFieldErrors(error, ["name"])).toEqual({})
    })

    it("returns nothing for a non-API error", () => {
        expect(applyServerFieldErrors(new Error("boom"), ["name"])).toEqual({})
    })
})

describe("firstServerFieldError", () => {
    it("surfaces a message for an unmapped field", () => {
        expect(firstServerFieldError(validationError({ selection_type: ["Unknown selection type."] }))).toBe(
            "Unknown selection type."
        )
    })

    it("returns nothing when the error carries no field errors", () => {
        expect(firstServerFieldError(validationError({}))).toBeUndefined()
    })

    it("returns nothing for a non-API error", () => {
        expect(firstServerFieldError(new Error("boom"))).toBeUndefined()
    })
})
