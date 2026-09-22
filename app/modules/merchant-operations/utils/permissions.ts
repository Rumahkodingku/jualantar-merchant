import { useSession } from "~/modules/auth"

/**
 * UI-level visibility helpers derived from the permissions returned by
 * `/auth/me`. These only decide what to show or enable; the API remains the
 * authorization boundary.
 */
export function useOperationsPermissions() {
    const { user } = useSession()
    const permissions = user?.permissions ?? []

    const has = (permission: string) => permissions.includes(permission)

    return {
        canView: has("merchant.operations.view"),
        canUpdateMerchantStatus: has("merchant.operations.status.update"),
        canUpdateMerchantProfile: has("merchant.operations.profile.update"),
        canViewOutlets: has("merchant.operations.outlets.view"),
        canCreateOutlet: has("merchant.operations.outlets.create"),
        canUpdateOutlet: has("merchant.operations.outlets.update"),
        canUpdateOutletStatus: has("merchant.operations.outlets.status.update"),
        canViewEmployees: has("merchant.operations.outlet_users.view"),
        canAssignEmployee: has("merchant.operations.outlet_users.assign"),
        canRemoveEmployee: has("merchant.operations.outlet_users.remove"),
        canUpdateEmployeeRole: has("merchant.operations.outlet_users.role.update"),
        canViewHours: has("merchant.operations.hours.view"),
        canUpdateHours: has("merchant.operations.hours.update"),
        canViewServiceArea: has("merchant.operations.service_area.view"),
        canUpdateServiceArea: has("merchant.operations.service_area.update"),
        canViewAvailability: has("merchant.operations.availability.view"),
    }
}
