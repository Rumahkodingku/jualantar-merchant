import {
    ActivityIcon,
    BellIcon,
    Building2Icon,
    CircleHelp,
    FileCheckIcon,
    InfoIcon,
    KeyRoundIcon,
    LanguagesIcon,
    LifeBuoyIcon,
    Settings,
    Shield,
    Store,
    StoreIcon,
    SunMoonIcon,
    UserCogIcon,
    WalletCards,
    WalletIcon,
} from "lucide-react"

import { ErrorState } from "~/components/error-state"
import { MenuItem } from "~/components/menu-item"
import { MenuSection } from "~/components/menu-section"
import { PageHeader } from "~/components/page-header"
import { Skeleton } from "~/components/ui/skeleton"
import { getApiErrorMessage } from "~/lib/api-form"
import { CAP, canViewOutletList, useAuthorization } from "~/modules/authorization"
import { useOperationalOutlets, useOperationalProfile, useOperationsSummary } from "~/modules/merchant-operations"

import { SettingsHero } from "../components/settings-hero"
import { SETTINGS_PATHS } from "../utils/paths"

export function SettingsHomePage() {
    const summary = useOperationsSummary()
    const profile = useOperationalProfile()
    const outlets = useOperationalOutlets({ per_page: 1 })
    const { user, can } = useAuthorization()

    const canManageMerchant = can(CAP.view)
    const canOpenOutlets = canViewOutletList(user)

    const businessName = summary.data?.merchant.business_name ?? profile.data?.business_name ?? "Usaha"
    const status = summary.data?.merchant.status ?? profile.data?.status ?? null
    const outletTotal = outlets.data ? outlets.data.meta.total : null
    const isPending = summary.isPending || profile.isPending
    const isError = summary.isError || profile.isError
    const settingsError = summary.isError ? summary.error : profile.error
    const hasMerchantAccess = canManageMerchant || canOpenOutlets

    return (
        <div className="flex flex-1 flex-col gap-6">
            <PageHeader title="Pengaturan" description="Kelola informasi usaha, preferensi, dan keamanan akun Anda." />

            {isPending ? (
                <Skeleton className="h-28 w-full rounded-2xl" />
            ) : isError ? (
                <ErrorState
                    title="Gagal memuat pengaturan"
                    description={getApiErrorMessage(settingsError)}
                    onRetry={() => {
                        void summary.refetch()
                        void profile.refetch()
                    }}
                />
            ) : status === null ? (
                <ErrorState title="Usaha belum ditemukan" description="Akun ini belum terhubung ke usaha mana pun." />
            ) : (
                <SettingsHero
                    businessName={businessName}
                    logoUrl={profile.data?.logo_url ?? null}
                    status={status}
                    outletTotal={outletTotal}
                    outletPending={outlets.isPending}
                />
            )}

            <div className="flex flex-1 flex-col gap-6 md:grid md:grid-cols-2 md:items-start md:gap-x-6 md:gap-y-8">
                {hasMerchantAccess ? (
                    <MenuSection icon={Store} title="Usaha" description="Informasi dan operasional usaha Anda.">
                        {canManageMerchant ? (
                            <MenuItem
                                to={SETTINGS_PATHS.profile}
                                icon={Building2Icon}
                                label="Profil usaha"
                                description="Nama usaha, logo, dan kontak operasional"
                            />
                        ) : null}

                        {canManageMerchant ? (
                            <MenuItem
                                to={SETTINGS_PATHS.status}
                                icon={ActivityIcon}
                                label="Status usaha"
                                description="Status aktif, tidak aktif, atau ditangguhkan"
                            />
                        ) : null}

                        {canOpenOutlets ? (
                            <MenuItem
                                to={SETTINGS_PATHS.outlets}
                                icon={StoreIcon}
                                label="Outlet"
                                description="Kelola alamat, jam, area layanan, dan karyawan"
                                badge={outletTotal === null ? undefined : String(outletTotal)}
                            />
                        ) : null}
                    </MenuSection>
                ) : null}

                <MenuSection
                    icon={WalletCards}
                    title="Keuangan & legal"
                    description="Pengaturan pencairan dana dan dokumen usaha."
                >
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
                        description="Status verifikasi dokumen usaha"
                        badge="Segera hadir"
                        disabled
                    />
                </MenuSection>

                <MenuSection
                    icon={Settings}
                    title="Preferensi aplikasi"
                    description="Atur tampilan dan pengalaman penggunaan."
                >
                    <MenuItem
                        to={SETTINGS_PATHS.appearance}
                        icon={SunMoonIcon}
                        label="Tampilan"
                        description="Mode terang, gelap, atau mengikuti sistem"
                    />

                    <MenuItem
                        to={SETTINGS_PATHS.notifications}
                        icon={BellIcon}
                        label="Notifikasi perangkat"
                        description="Izin dan jenis notifikasi yang diterima"
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

                <MenuSection
                    icon={Shield}
                    title="Akun & keamanan"
                    description="Kelola informasi dan keamanan akun Anda."
                >
                    <MenuItem
                        to={SETTINGS_PATHS.account}
                        icon={UserCogIcon}
                        label="Akun"
                        description="Lihat informasi akun dan keluar dari aplikasi"
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

                <MenuSection icon={CircleHelp} title="Bantuan" description="Dapatkan bantuan dan informasi aplikasi.">
                    <MenuItem
                        to={SETTINGS_PATHS.help}
                        icon={LifeBuoyIcon}
                        label="Bantuan & dukungan"
                        description="Jawaban cepat dan kontak tim kami"
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
