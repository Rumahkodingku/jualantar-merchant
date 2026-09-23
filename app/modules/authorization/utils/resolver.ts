import type { AuthUser, OutletUserRole } from "~/modules/auth"

import { CAP, MERCHANT_OWNER_ROLE, OUTLET_ROLE_CAPABILITIES, type OperationsCapability } from "./capabilities"

/**
 * Global authorization: does the user hold this capability *globally*?
 *
 * Global `permissions` are only meaningful for account-level abilities (the
 * merchant owner holds every `merchant.operations.*` globally). They must never
 * be used to infer outlet-scoped capability for non-owners.
 */
export function can(user: AuthUser | null, capability: OperationsCapability): boolean {
    return user?.permissions.includes(capability) ?? false
}

/** The merchant owner: global role `merchant`, exempt from per-outlet checks by the API. */
export function isMerchantOwner(user: AuthUser | null): boolean {
    return user?.roles.includes(MERCHANT_OWNER_ROLE) ?? false
}

/** Resolve the user's role on a specific outlet, or `null` when there is no assignment. */
export function roleForOutlet(user: AuthUser | null, outletId: string | undefined): OutletUserRole | null {
    if (user === null || outletId === undefined || outletId === "") {
        return null
    }

    return user.outletAssignments.find((assignment) => assignment.outletId === outletId)?.role ?? null
}

/**
 * Outlet authorization: the single decision point for outlet-scoped actions.
 *
 * Order of evaluation mirrors the API (`MerchantOperationsAuthorization::authorizeOutletAction`):
 * an explicit owner/global grant wins, otherwise the assignment's role capability.
 * Fail-closed: unknown outlet or missing/invalid assignment → `false`.
 */
export function canForOutlet(
    user: AuthUser | null,
    outletId: string | undefined,
    capability: OperationsCapability
): boolean {
    if (user === null) {
        return false
    }

    if (can(user, capability)) {
        return true
    }

    const role = roleForOutlet(user, outletId)

    if (role === null) {
        return false
    }

    return OUTLET_ROLE_CAPABILITIES[role].includes(capability)
}

/**
 * Can the user open the outlet list at all? Owners see every outlet; an outlet
 * employee reaches the list only through at least one assignment.
 */
export function canViewOutletList(user: AuthUser | null): boolean {
    if (user === null) {
        return false
    }

    return can(user, CAP.outletsView) || user.outletAssignments.length > 0
}
