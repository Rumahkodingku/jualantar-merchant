import { CalendarClockIcon, MapPinnedIcon, SignalIcon, UsersIcon } from "lucide-react"

import { MenuItem } from "~/components/menu-item"
import { MenuSection } from "~/components/menu-section"

import { outletAvailabilityPath, outletEmployeesPath, outletHoursPath, outletServiceAreaPath } from "../../utils/routes"
import { outletServiceAreaSummary } from "../../utils/service-area-summary"
import type { OperationalOutlet } from "../../types/merchant-operations.types"

export function OutletSectionNav({
    outlet,
    canViewHours,
    canViewServiceArea,
    canViewEmployees,
    canViewAvailability,
}: {
    outlet: OperationalOutlet
    canViewHours: boolean
    canViewServiceArea: boolean
    canViewEmployees: boolean
    canViewAvailability: boolean
}) {
    return (
        <MenuSection title="Pengaturan outlet" description="Atur pengaturan outlet anda dengan detail">
            {canViewAvailability ? (
                <MenuItem
                    to={outletAvailabilityPath(outlet.id)}
                    icon={SignalIcon}
                    label="Status Operasional"
                    description="Buka/tutup otomatis dari status dan jam operasional"
                />
            ) : null}

            {canViewHours ? (
                <MenuItem
                    to={outletHoursPath(outlet.id)}
                    icon={CalendarClockIcon}
                    label="Jam Operasional"
                    description="Atur jadwal buka setiap hari"
                />
            ) : null}

            {canViewServiceArea ? (
                <MenuItem
                    to={outletServiceAreaPath(outlet.id)}
                    icon={MapPinnedIcon}
                    label="Area Layanan"
                    description={outletServiceAreaSummary(outlet)}
                />
            ) : null}

            {canViewEmployees ? (
                <MenuItem
                    to={outletEmployeesPath(outlet.id)}
                    icon={UsersIcon}
                    label="Karyawan"
                    description="Kelola akses karyawan untuk outlet ini"
                />
            ) : null}
        </MenuSection>
    )
}
