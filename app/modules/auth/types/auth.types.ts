export type AuthUser = {
    id: string
    email: string
    roles: string[]
    permissions: string[]
    created_at: string | null
    updated_at: string | null
}

export type LoginInput = {
    email: string
    password: string
}

export type LoginResult = {
    token: string
    token_type: string
    user: AuthUser
}

export type RegisterMerchantInput = {
    email: string
    phone: string
    password: string
    password_confirmation: string
    terms_accepted: boolean
}

export type RegisteredMerchant = {
    id: string
    email: string
    phone: string | null
    email_verified: boolean
}

export type VerifyEmailParams = {
    id: string
    hash: string
    expires?: string
    signature?: string
}
