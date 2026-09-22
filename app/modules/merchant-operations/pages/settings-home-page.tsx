import {
    Building2Icon,
    CalendarClockIcon,
    MapPinnedIcon,
    SignalIcon,
    StoreIcon,
    SunMoonIcon,
    UserCogIcon,
    UsersIcon,
} from "lucide-react"

import { ErrorState } from "~/components/error-state"
import { Skeleton } from "~/components/ui/skeleton"
import { getApiErrorMessage } from "~/lib/api-form"

import { SettingsHero } from "../components/settings/settings-hero"
import { SettingsMenuItem } from "../components/settings/settings-menu-item"
import { SettingsSection } from "../components/settings/settings-section"
import { useOperationsPermissions } from "../utils/permissions"
import {
    useOperationalOutlets,
    useOperationalProfile,
    useOperationsSummary,
} from "../services/merchant-operations.queries"
import { SETTINGS_PATHS } from "../utils/routes"

export function SettingsHomePage() {
    const permissions = useOperationsPermissions()
    const summary = useOperationsSummary()
    const profile = useOperationalProfile()
    const outlets = useOperationalOutlets({ per_page: 1 })

    const businessName = summary.data?.merchant.business_name ?? profile.data?.business_name ?? "Merchant"
    const status = summary.data?.merchant.status ?? profile.data?.status ?? null
    const outletTotal = outlets.data?.meta.total ?? 0
    const isPending = summary.isPending && profile.isPending
    const isError = summary.isError && profile.isError

    return (
        <div className="flex flex-1 flex-col gap-6">
            {isPending ? (
                <Skeleton className="h-24 w-full rounded-2xl" />
            ) : isError ? (
                <ErrorState
                    title="Gagal memuat pengaturan"
                    description={getApiErrorMessage(summary.error ?? profile.error)}
                    onRetry={() => {
                        void summary.refetch()
                        void profile.refetch()
                    }}
                />
            ) : status === null ? (
                <ErrorState
                    title="Merchant tidak ditemukan"
                    description="Akun ini belum terhubung ke merchant mana pun."
                />
            ) : (
                <SettingsHero
                    businessName={businessName}
                    logoUrl={profile.data?.logo_url ?? null}
                    status={status}
                    outletTotal={outletTotal}
                />
            )}

            <SettingsSection title="Merchant">
                <SettingsMenuItem
                    to={SETTINGS_PATHS.profile}
                    icon={Building2Icon}
                    label="Profil Merchant"
                    description="Nama usaha, logo, dan kontak operasional"
                />
                <SettingsMenuItem
                    to={SETTINGS_PATHS.status}
                    icon={SignalIcon}
                    label="Status Merchant"
                    description="Aktif, tidak aktif, atau ditangguhkan"
                />
            </SettingsSection>

            <SettingsSection title="Operasional">
                <SettingsMenuItem
                    to={SETTINGS_PATHS.outlets}
                    icon={StoreIcon}
                    label="Outlet"
                    description="Kelola outlet, alamat, dan statusnya"
                    badge={outletTotal === 0 ? undefined : String(outletTotal)}
                />
                {permissions.canViewEmployees ? (
                    <SettingsMenuItem
                        to={`${SETTINGS_PATHS.home}/employees`}
                        icon={UsersIcon}
                        label="Karyawan"
                        description="Tugaskan karyawan ke outlet"
                    />
                ) : null}
                {permissions.canViewHours ? (
                    <SettingsMenuItem
                        to={`${SETTINGS_PATHS.home}/hours`}
                        icon={CalendarClockIcon}
                        label="Jam Operasional"
                        description="Jadwal buka outlet setiap hari"
                    />
                ) : null}
                {permissions.canViewServiceArea ? (
                    <SettingsMenuItem
                        to={`${SETTINGS_PATHS.home}/service-area`}
                        icon={MapPinnedIcon}
                        label="Area Layanan"
                        description="Radius atau wilayah layanan outlet"
                    />
                ) : null}
                {permissions.canViewAvailability ? (
                    <SettingsMenuItem
                        to={`${SETTINGS_PATHS.home}/availability`}
                        icon={SignalIcon}
                        label="Status Operasional"
                        description="Buka/tutup yang dihitung otomatis"
                    />
                ) : null}
            </SettingsSection>

            <SettingsSection title="Akun">
                <SettingsMenuItem
                    to={SETTINGS_PATHS.appearance}
                    icon={SunMoonIcon}
                    label="Tampilan"
                    description="Mode terang, gelap, atau mengikuti sistem"
                />
                <SettingsMenuItem
                    to={SETTINGS_PATHS.account}
                    icon={UserCogIcon}
                    label="Akun & Keluar"
                    description="Informasi akun dan keluar aplikasi"
                />
            </SettingsSection>
        </div>
    )
}
