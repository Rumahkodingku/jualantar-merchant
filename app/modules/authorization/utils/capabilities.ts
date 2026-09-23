import type { OutletUserRole } from "~/modules/auth"

export const CAP = {
    view: "merchant.operations.view",
    statusUpdate: "merchant.operations.status.update",
    profileUpdate: "merchant.operations.profile.update",
    outletsView: "merchant.operations.outlets.view",
    outletsCreate: "merchant.operations.outlets.create",
    outletsUpdate: "merchant.operations.outlets.update",
    outletsStatusUpdate: "merchant.operations.outlets.status.update",
    outletUsersView: "merchant.operations.outlet_users.view",
    outletUsersAssign: "merchant.operations.outlet_users.assign",
    outletUsersRemove: "merchant.operations.outlet_users.remove",
    outletUsersRoleUpdate: "merchant.operations.outlet_users.role.update",
    hoursView: "merchant.operations.hours.view",
    hoursUpdate: "merchant.operations.hours.update",
    serviceAreaView: "merchant.operations.service_area.view",
    serviceAreaUpdate: "merchant.operations.service_area.update",
    availabilityView: "merchant.operations.availability.view",
} as const

export type OperationsCapability = (typeof CAP)[keyof typeof CAP]

export const OUTLET_ROLE_CAPABILITIES: Record<OutletUserRole, readonly OperationsCapability[]> = {
    outlet_manager: [
        CAP.view,
        CAP.outletsView,
        CAP.outletsUpdate,
        CAP.outletsStatusUpdate,
        CAP.outletUsersView,
        CAP.outletUsersAssign,
        CAP.outletUsersRemove,
        CAP.outletUsersRoleUpdate,
        CAP.hoursView,
        CAP.hoursUpdate,
        CAP.serviceAreaView,
        CAP.serviceAreaUpdate,
        CAP.availabilityView,
    ],
    outlet_staff: [CAP.view, CAP.outletsView, CAP.hoursView, CAP.serviceAreaView, CAP.availabilityView],
}

/** Global role that identifies the merchant owner (owner bypass on the API). */
export const MERCHANT_OWNER_ROLE = "merchant"
