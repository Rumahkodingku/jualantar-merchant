/**
 * Outlet-scoped role of a `merchant.merchant_outlet_users` assignment.
 *
 * These are never granted as global Spatie roles; they only exist per outlet.
 * Source: `jualantar-api` `App\Modules\Merchant\Domain\Enums\OutletUserRole`.
 */
export type OutletUserRole = "outlet_manager" | "outlet_staff"

/** A user's role on a single outlet, normalized from `outlet_assignments`. */
export type OutletAssignment = {
    outletId: string
    role: OutletUserRole
}

export type AuthUser = {
    id: string
    email: string
    roles: string[]
    permissions: string[]
    outletAssignments: OutletAssignment[]
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
