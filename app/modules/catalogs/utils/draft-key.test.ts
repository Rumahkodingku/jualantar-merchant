import { afterEach, describe, expect, it, vi } from "vitest"

import { draftKey } from "./draft-key"

/**
 * These keys are React keys and dnd-kit ids, so two rows sharing one would make
 * the wizard address the wrong row — the merchant edits a variant they did not
 * click. The first test proves the ids are distinct often enough for a form to
 * hold; the second pins the reason the generator cannot be `crypto.randomUUID`.
 */
describe("draftKey", () => {
    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it("keeps the prefix and adds eight hex characters", () => {
        expect(draftKey("var")).toMatch(/^var-[0-9a-f]{8}$/)
        expect(draftKey("grp")).toMatch(/^grp-[0-9a-f]{8}$/)
        expect(draftKey("mod")).toMatch(/^mod-[0-9a-f]{8}$/)
        expect(draftKey("med")).toMatch(/^med-[0-9a-f]{8}$/)
    })

    it("gives a large form's worth of rows distinct keys", () => {
        const keys = new Set(Array.from({ length: 1000 }, () => draftKey("var")))

        expect(keys.size).toBe(1000)
    })

    it("does not repeat itself when the source returns the same bytes twice", () => {
        // A stand-in for a degenerate source. The prefix still separates rows,
        // and a non-random suffix would be visible here rather than in a product.
        vi.stubGlobal("crypto", { getRandomValues: (bytes: Uint8Array) => bytes.fill(0) })

        expect(draftKey("var")).toBe("var-00000000")
    })

    it("works on a plain-HTTP origin, where randomUUID does not exist", () => {
        // The dev server is opened to the LAN, and reaching it at a LAN address
        // over plain HTTP is not a secure context. That is the case this test
        // exists for: `crypto.randomUUID` is undefined there, and a generator
        // built on it fails the moment the merchant adds their first row.
        const getRandomValues = globalThis.crypto.getRandomValues.bind(globalThis.crypto)

        vi.stubGlobal("crypto", { getRandomValues })

        expect("randomUUID" in globalThis.crypto).toBe(false)
        expect(draftKey("grp")).toMatch(/^grp-[0-9a-f]{8}$/)
    })
})
