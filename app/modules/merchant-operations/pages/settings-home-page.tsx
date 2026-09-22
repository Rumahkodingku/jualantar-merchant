import { ActivityIcon, Building2Icon, StoreIcon, SunMoonIcon, UserCogIcon } from "lucide-react"

import { ErrorState } from "~/components/error-state"
import { Skeleton } from "~/components/ui/skeleton"
import { Text } from "~/components/ui/text"
import { getApiErrorMessage } from "~/lib/api-form"

import { SettingsHero } from "../components/settings/settings-hero"
import { SettingsMenuItem } from "../components/settings/settings-menu-item"
import { SettingsSection } from "../components/settings/settings-section"
import {
    useOperationalOutlets,
    useOperationalProfile,
    useOperationsSummary,
} from "../services/merchant-operations.queries"
import { SETTINGS_PATHS } from "../utils/routes"

export function SettingsHomePage() {
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
            <header className="flex flex-col gap-1">
                <Text as="h1" variant="2xl" weight="semibold" className="tracking-tight">
                    Pengaturan
                </Text>
                <Text variant="sm" className="text-muted-foreground">
                    Kelola merchant, outlet, dan akun Anda.
                </Text>
            </header>

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

            <div className="flex flex-1 flex-col gap-6 md:grid md:grid-cols-2 md:items-start">
                <SettingsSection title="Merchant">
                    <SettingsMenuItem
                        to={SETTINGS_PATHS.profile}
                        icon={Building2Icon}
                        label="Profil merchant"
                        description="Nama usaha, logo, dan kontak operasional"
                    />
                    <SettingsMenuItem
                        to={SETTINGS_PATHS.status}
                        icon={ActivityIcon}
                        label="Status merchant"
                        description="Aktif, tidak aktif, atau ditangguhkan"
                    />
                    <SettingsMenuItem
                        to={SETTINGS_PATHS.outlets}
                        icon={StoreIcon}
                        label="Outlet"
                        description="Kelola alamat, jam, area, dan karyawan per outlet"
                        badge={outletTotal === 0 ? undefined : String(outletTotal)}
                    />
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
                        label="Akun & keluar"
                        description="Informasi akun dan keluar aplikasi"
                    />
                </SettingsSection>
            </div>
        </div>
    )
}
