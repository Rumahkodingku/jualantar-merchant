import type { OutletStatus, OutletUserRole } from "../types/merchant-operations.types"

export function outletStatusLabel(status: OutletStatus): string {
    return status === "active" ? "Aktif" : "Nonaktif"
}

export function outletStatusBadgeVariant(status: OutletStatus): "default" | "secondary" {
    return status === "active" ? "default" : "secondary"
}

export function outletStatusDescription(status: OutletStatus): string {
    return status === "active"
        ? "Outlet aktif dan dapat menerima pesanan sesuai jam operasional."
        : "Outlet nonaktif dan tidak menerima pesanan."
}

export const OUTLET_ROLE_LABEL: Record<OutletUserRole, string> = {
    outlet_manager: "Manajer Outlet",
    outlet_staff: "Staf Outlet",
}

export const OUTLET_ROLE_DESCRIPTION: Record<OutletUserRole, string> = {
    outlet_manager: "Mengelola outlet yang ditugaskan, termasuk jam operasional dan area layanan.",
    outlet_staff: "Melakukan pemantauan outlet yang ditugaskan tanpa mengubah konfigurasi.",
}

export const OUTLET_ROLE_OPTIONS: { value: OutletUserRole; label: string }[] = [
    { value: "outlet_manager", label: OUTLET_ROLE_LABEL.outlet_manager },
    { value: "outlet_staff", label: OUTLET_ROLE_LABEL.outlet_staff },
]
