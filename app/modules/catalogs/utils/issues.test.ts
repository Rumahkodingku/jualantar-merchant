import { describe, expect, it } from "vitest"

import { issuesToMessages } from "./issues"

describe("issuesToMessages", () => {
    it("maps the first issue of each field", () => {
        const messages = issuesToMessages([
            { path: ["name"], message: "Nama wajib diisi." },
            { path: ["name"], message: "Pesan kedua diabaikan." },
            { path: ["price"], message: "Harga tidak valid." },
        ])

        expect(messages).toEqual({ name: "Nama wajib diisi.", price: "Harga tidak valid." })
    })

    it("falls back to an empty key when the path is empty", () => {
        expect(issuesToMessages([{ path: [], message: "Error umum." }])).toEqual({ "": "Error umum." })
    })

    it("returns an empty record when there are no issues", () => {
        expect(issuesToMessages([])).toEqual({})
    })
})
