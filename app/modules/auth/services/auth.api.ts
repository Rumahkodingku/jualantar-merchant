import { api } from "~/lib/api"

import type {
    AuthUser,
    LoginInput,
    LoginResult,
    RegisterMerchantInput,
    RegisteredMerchant,
    VerifyEmailParams,
} from "../types/auth.types"

export async function login(input: LoginInput): Promise<LoginResult> {
    const { data } = await api.post<{ data: LoginResult }>("/auth/login", input)

    return data.data
}

export async function fetchMe(): Promise<AuthUser> {
    const { data } = await api.get<{ data: AuthUser }>("/auth/me")

    return data.data
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
