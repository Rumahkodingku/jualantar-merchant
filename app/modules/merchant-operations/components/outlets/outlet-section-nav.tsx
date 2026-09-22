import { CalendarClockIcon, MapPinnedIcon, SignalIcon, UsersIcon } from "lucide-react"

import { SettingsMenuItem } from "../settings/settings-menu-item"
import { SettingsSection } from "../settings/settings-section"
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
        <SettingsSection title="Pengaturan outlet">
            {canViewAvailability ? (
                <SettingsMenuItem
                    to={outletAvailabilityPath(outlet.id)}
                    icon={SignalIcon}
                    label="Status Operasional"
                    description="Buka/tutup otomatis dari status dan jam operasional"
                />
            ) : null}

            {canViewHours ? (
                <SettingsMenuItem
                    to={outletHoursPath(outlet.id)}
                    icon={CalendarClockIcon}
                    label="Jam Operasional"
                    description="Atur jadwal buka setiap hari"
                />
            ) : null}

            {canViewServiceArea ? (
                <SettingsMenuItem
                    to={outletServiceAreaPath(outlet.id)}
                    icon={MapPinnedIcon}
                    label="Area Layanan"
                    description={outletServiceAreaSummary(outlet)}
                />
            ) : null}

            {canViewEmployees ? (
                <SettingsMenuItem
                    to={outletEmployeesPath(outlet.id)}
                    icon={UsersIcon}
                    label="Karyawan"
                    description="Kelola akses karyawan untuk outlet ini"
                />
            ) : null}
        </SettingsSection>
    )
}
