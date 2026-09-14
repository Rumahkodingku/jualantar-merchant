import { afterEach, describe, expect, it, vi } from "vitest"

import { api } from "~/lib/api"

import { registerMerchant, resendVerification, verifyEmail } from "./auth.api"

afterEach(() => {
    vi.restoreAllMocks()
})

describe("auth api", () => {
    it("registers a merchant account", async () => {
        const spy = vi.spyOn(api, "post").mockResolvedValue({
            data: {
                data: {
                    id: "user-1",
                    email: "merchant@example.com",
                    phone: "+6281234567890",
                    email_verified: false,
                },
            },
        })

        const result = await registerMerchant({
            email: "merchant@example.com",
            phone: "081234567890",
            full_name: "Merchant Owner",
            password: "secret123",
            password_confirmation: "secret123",
            terms_accepted: true,
        })

        expect(spy).toHaveBeenCalledWith(
            "/merchants/register",
            expect.objectContaining({
                email: "merchant@example.com",
                terms_accepted: true,
            })
        )
        expect(result.email_verified).toBe(false)
    })

    it("resends the verification email", async () => {
        const spy = vi.spyOn(api, "post").mockResolvedValue({ data: { data: null } })

        await resendVerification("merchant@example.com")

        expect(spy).toHaveBeenCalledWith("/auth/email/verification-notification", {
            email: "merchant@example.com",
        })
    })

    it("verifies the email with the signed params", async () => {
        const spy = vi.spyOn(api, "get").mockResolvedValue({ data: null })

        await verifyEmail({
            id: "user-1",
            hash: "hash-1",
            expires: "123",
            signature: "sig",
        })

        expect(spy).toHaveBeenCalledWith("/auth/email/verify/user-1/hash-1", {
            params: { expires: "123", signature: "sig" },
        })
    })
})
