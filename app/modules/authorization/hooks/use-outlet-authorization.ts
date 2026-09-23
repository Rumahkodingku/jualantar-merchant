import { useMemo } from "react"

import { useSession } from "~/modules/auth"

import type { OperationsCapability } from "../utils/capabilities"
import { canForOutlet, isMerchantOwner, roleForOutlet } from "../utils/resolver"

/**
 * Outlet-scoped authorization for a single outlet. `outletId` always comes from
 * the route param, so switching outlets recomputes the effective capability and
 * never leaks a decision from the previously active outlet.
 */
export function useOutletAuthorization(outletId: string | undefined) {
    const { user, isLoading } = useSession()

    return useMemo(
        () => ({
            role: roleForOutlet(user, outletId),
            isLoading,
            isOwner: isMerchantOwner(user),
            can: (capability: OperationsCapability) => canForOutlet(user, outletId, capability),
        }),
        [user, outletId, isLoading]
    )
}
