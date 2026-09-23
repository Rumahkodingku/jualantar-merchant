import { describe, expect, it } from "vitest"

import { ApiError } from "~/lib/api"

import { authorizationErrorMessage } from "./authorization-error"

function apiError(status: number, detail = "Detail dari server"): ApiError {
    return new ApiError({ status, code: "code", title: "Title", detail })
}

describe("authorizationErrorMessage", () => {
    it("maps 403 to a permission message instead of the generic detail", () => {
        expect(authorizationErrorMessage(apiError(403))).toBe("Anda tidak memiliki izin untuk tindakan ini.")
    })

    it("maps 404 to a not-found message", () => {
        expect(authorizationErrorMessage(apiError(404))).toBe("Data tidak ditemukan.")
    })

    it("passes through other API errors", () => {
        expect(authorizationErrorMessage(apiError(500, "Server bermasalah"))).toBe("Server bermasalah")
    })

    it("falls back for non-API errors", () => {
        expect(authorizationErrorMessage(new Error("boom"), "Fallback")).toBe("Fallback")
    })
})
