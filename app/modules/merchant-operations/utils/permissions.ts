import { useMemo } from "react"

import { useSession } from "~/modules/auth"
import { CAP, can, canForOutlet, canViewOutletList, type OperationsCapability } from "~/modules/authorization"

/**
 * Ergonomic boolean bag for the merchant-operations screens.
 *
 * Global values are account-scoped; outlet values are computed for the given
 * outlet through the centralized authorization resolver (never from raw global
 * permissions). Outlet booleans are `false` when no `outletId` is provided.
 *
 * These flags only decide what to show or enable; the API remains the
 * authorization boundary.
 */
export function useOperationsPermissions(outletId?: string) {
    const { user, isLoading } = useSession()

    return useMemo(() => {
        const forOutlet = (capability: OperationsCapability) =>
            outletId === undefined ? false : canForOutlet(user, outletId, capability)

        return {
            isLoading,

            // Global / merchant scope
            canView: can(user, CAP.view),
            canUpdateMerchantStatus: can(user, CAP.statusUpdate),
            canUpdateMerchantProfile: can(user, CAP.profileUpdate),
            canCreateOutlet: can(user, CAP.outletsCreate),
            canViewOutletList: canViewOutletList(user),

            // Outlet scope
            canViewOutlet: forOutlet(CAP.outletsView),
            canUpdateOutlet: forOutlet(CAP.outletsUpdate),
            canUpdateOutletStatus: forOutlet(CAP.outletsStatusUpdate),
            canViewEmployees: forOutlet(CAP.outletUsersView),
            canAssignEmployee: forOutlet(CAP.outletUsersAssign),
            canRemoveEmployee: forOutlet(CAP.outletUsersRemove),
            canUpdateEmployeeRole: forOutlet(CAP.outletUsersRoleUpdate),
            canViewHours: forOutlet(CAP.hoursView),
            canUpdateHours: forOutlet(CAP.hoursUpdate),
            canViewServiceArea: forOutlet(CAP.serviceAreaView),
            canUpdateServiceArea: forOutlet(CAP.serviceAreaUpdate),
            canViewAvailability: forOutlet(CAP.availabilityView),
        }
    }, [user, outletId, isLoading])
}
