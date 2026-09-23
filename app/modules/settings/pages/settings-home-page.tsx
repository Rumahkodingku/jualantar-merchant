import {
    ActivityIcon,
    BellIcon,
    Building2Icon,
    FileCheckIcon,
    InfoIcon,
    KeyRoundIcon,
    LanguagesIcon,
    LifeBuoyIcon,
    StoreIcon,
    SunMoonIcon,
    UserCogIcon,
    WalletIcon,
} from "lucide-react"

import { ErrorState } from "~/components/error-state"
import { Skeleton } from "~/components/ui/skeleton"
import { Text } from "~/components/ui/text"
import { getApiErrorMessage } from "~/lib/api-form"

import { MenuItem } from "~/components/menu-item"
import { MenuSection } from "~/components/menu-section"
import { useOperationalOutlets, useOperationalProfile, useOperationsSummary } from "~/modules/merchant-operations"

import { SettingsHero } from "../components/settings-hero"
import { SETTINGS_PATHS } from "../utils/paths"

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
                    Kelola merchant, aplikasi, dan akun Anda.
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
                <MenuSection title="Merchant">
                    <MenuItem
                        to={SETTINGS_PATHS.profile}
                        icon={Building2Icon}
                        label="Profil merchant"
                        description="Nama usaha, logo, dan kontak operasional"
                    />
                    <MenuItem
                        to={SETTINGS_PATHS.status}
                        icon={ActivityIcon}
                        label="Status merchant"
                        description="Aktif, tidak aktif, atau ditangguhkan"
                    />
                    <MenuItem
                        to={SETTINGS_PATHS.outlets}
                        icon={StoreIcon}
                        label="Outlet"
                        description="Kelola alamat, jam, area, dan karyawan per outlet"
                        badge={outletTotal === 0 ? undefined : String(outletTotal)}
                    />
                    <MenuItem
                        to={SETTINGS_PATHS.payout}
                        icon={WalletIcon}
                        label="Rekening pencairan"
                        description="Rekening tujuan pencairan dana usaha"
                        badge="Segera hadir"
                        disabled
                    />
                    <MenuItem
                        to={SETTINGS_PATHS.documents}
                        icon={FileCheckIcon}
                        label="Dokumen & verifikasi"
                        description="Lihat status verifikasi dokumen usaha"
                        badge="Segera hadir"
                        disabled
                    />
                </MenuSection>

                <MenuSection title="Umum">
                    <MenuItem
                        to={SETTINGS_PATHS.appearance}
                        icon={SunMoonIcon}
                        label="Tampilan"
                        description="Mode terang, gelap, atau mengikuti sistem"
                    />
                    <MenuItem
                        to={SETTINGS_PATHS.notifications}
                        icon={BellIcon}
                        label="Notifikasi"
                        description="Izin push dan jenis notifikasi"
                    />
                    <MenuItem
                        to={SETTINGS_PATHS.language}
                        icon={LanguagesIcon}
                        label="Bahasa"
                        description="Bahasa aplikasi"
                        badge="Segera hadir"
                        disabled
                    />
                </MenuSection>

                <MenuSection title="Akun & keamanan">
                    <MenuItem
                        to={SETTINGS_PATHS.account}
                        icon={UserCogIcon}
                        label="Akun & keluar"
                        description="Informasi akun dan keluar aplikasi"
                    />
                    <MenuItem
                        to={SETTINGS_PATHS.password}
                        icon={KeyRoundIcon}
                        label="Ubah kata sandi"
                        description="Ganti kata sandi akun Anda"
                        badge="Segera hadir"
                        disabled
                    />
                </MenuSection>

                <MenuSection title="Bantuan">
                    <MenuItem
                        to={SETTINGS_PATHS.help}
                        icon={LifeBuoyIcon}
                        label="Bantuan & dukungan"
                        description="Jawaban cepat dan hubungi tim kami"
                    />
                    <MenuItem
                        to={SETTINGS_PATHS.about}
                        icon={InfoIcon}
                        label="Tentang aplikasi"
                        description="Versi, kebijakan, dan ketentuan"
                    />
                </MenuSection>
            </div>
        </div>
    )
}
