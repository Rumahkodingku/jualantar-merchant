import type { ReactNode } from "react"
import { Navigate } from "react-router"

import type { OperationsCapability } from "../utils/capabilities"
import { useAuthorization } from "../hooks/use-authorization"
import { useOutletAuthorization } from "../hooks/use-outlet-authorization"
import { ForbiddenState } from "./forbidden-state"

/**
 * Whole-route guard for a global capability. Unauthorized users are sent to the
 * dedicated `/403` route (never disguised as a 404). The session is left intact.
 */
export function RequireCapability({ capability, children }: { capability: OperationsCapability; children: ReactNode }) {
    const { can, isLoading } = useAuthorization()

    if (isLoading) {
        return null
    }

    if (!can(capability)) {
        return <Navigate to="/403" replace />
    }

    return <>{children}</>
}

/**
 * Inline guard for outlet-scoped pages/sections. Renders a forbidden state in
 * place when the user lacks the capability for this outlet, so the surrounding
 * shell (header, navigation) stays usable.
 */
export function OutletCapabilityGuard({
    outletId,
    capability,
    children,
}: {
    outletId: string | undefined
    capability: OperationsCapability
    children: ReactNode
}) {
    const { can, isLoading } = useOutletAuthorization(outletId)

    if (isLoading) {
        return null
    }

    if (!can(capability)) {
        return <ForbiddenState />
    }

    return <>{children}</>
}
