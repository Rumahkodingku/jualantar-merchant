import { api } from "~/lib/api"

import { normalizeAuthUser } from "../schemas/auth-user.schema"
import type {
    AuthUser,
    LoginInput,
    LoginResult,
    RegisterMerchantInput,
    RegisteredMerchant,
    VerifyEmailParams,
} from "../types/auth.types"

export async function login(input: LoginInput): Promise<LoginResult> {
    const { data } = await api.post<{ data: { token: string; token_type: string; user: unknown } }>(
        "/auth/login",
        input
    )

    return {
        token: data.data.token,
        token_type: data.data.token_type,
        user: normalizeAuthUser(data.data.user),
    }
}

export async function fetchMe(): Promise<AuthUser> {
    const { data } = await api.get<{ data: unknown }>("/auth/me")

    return normalizeAuthUser(data.data)
}

export async function logout(): Promise<void> {
    await api.post("/auth/logout")
}

export async function registerMerchant(input: RegisterMerchantInput): Promise<RegisteredMerchant> {
    const { data } = await api.post<{ data: RegisteredMerchant }>("/merchants/register", input)

    return data.data
}

export async function resendVerification(email: string): Promise<void> {
    await api.post("/auth/email/verification-notification", { email })
}

export async function verifyEmail(params: VerifyEmailParams): Promise<void> {
    await api.get(`/auth/email/verify/${params.id}/${params.hash}`, {
        params: {
            expires: params.expires,
            signature: params.signature,
        },
    })
}
