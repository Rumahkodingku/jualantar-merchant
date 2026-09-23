import { useMemo } from "react"

import { useSession } from "~/modules/auth"

import type { OperationsCapability } from "../utils/capabilities"
import { can, isMerchantOwner } from "../utils/resolver"

/**
 * Global/account authorization. Consumers must not read `user.permissions`
 * directly; go through `can()` so the decision stays centralized.
 */
export function useAuthorization() {
    const { user, isLoading } = useSession()

    return useMemo(
        () => ({
            user,
            isLoading,
            isOwner: isMerchantOwner(user),
            can: (capability: OperationsCapability) => can(user, capability),
        }),
        [user, isLoading]
    )
}
