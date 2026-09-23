import {
    BanknoteIcon,
    NotebookPenIcon,
    PauseCircleIcon,
    PlusIcon,
    SettingsIcon,
    ShoppingBagIcon,
    TagIcon,
    type LucideIcon,
} from "lucide-react"
import { Link } from "react-router"

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Skeleton } from "~/components/ui/skeleton"
import { Text } from "~/components/ui/text"
import { ErrorState } from "~/components/error-state"
import { getApiErrorMessage } from "~/lib/api-form"
import { merchantStatusPresentation, useOperationalOutlets, useOperationsSummary } from "~/modules/merchant-operations"
import { SETTINGS_PATHS } from "~/modules/settings"
import type { MerchantRegistration } from "~/modules/merchant-registration"
import { PROMOTIONS_PATHS } from "~/modules/promotions"
import { PRODUCTS_PATHS } from "~/modules/products"
import { cn } from "~/lib/utils"

const SHORTCUTS: { to: string; label: string; description: string; icon: LucideIcon }[] = [
    { to: "/orders", label: "Pesanan", description: "Lihat pesanan pelanggan", icon: NotebookPenIcon },
    { to: PRODUCTS_PATHS.home, label: "Produk", description: "Kelola produk", icon: ShoppingBagIcon },
    { to: PROMOTIONS_PATHS.home, label: "Promo", description: "Buat promo", icon: TagIcon },
    { to: "/finances", label: "Keuangan", description: "Saldo & transaksi", icon: BanknoteIcon },
    { to: SETTINGS_PATHS.home, label: "Pengaturan", description: "Outlet & akun", icon: SettingsIcon },
]

function SuspendedBanner() {
    return (
        <Alert variant="destructive">
            <PauseCircleIcon aria-hidden="true" />
            <AlertTitle>Akun merchant dijeda</AlertTitle>
            <AlertDescription>
                Sementara ini merchant Anda tidak dapat menerima pesanan. Hubungi tim JualAntar untuk informasi lebih
                lanjut.
            </AlertDescription>
        </Alert>
    )
}

export function MerchantHome({ registration }: { registration: MerchantRegistration }) {
    const summary = useOperationsSummary()
    const outlets = useOperationalOutlets({ per_page: 1 })

    const summaryStatus = summary.data?.merchant.status
    const presentation = summaryStatus === undefined ? null : merchantStatusPresentation(summaryStatus)
    const businessName = summary.data?.merchant.business_name ?? registration.business_name ?? "Merchant"
    const suspended = registration.merchant_status === "suspended" || summaryStatus === "suspended"
    const outletTotal = outlets.data?.meta.total ?? 0

    const isPending = summary.isPending || outlets.isPending
    const isError = summary.isError && outlets.isError

    if (isPending) {
        return (
            <div className="flex flex-col gap-4">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
        )
    }

    if (isError) {
        return (
            <ErrorState
                title="Gagal memuat beranda"
                description={getApiErrorMessage(summary.error ?? outlets.error)}
                onRetry={() => {
                    void summary.refetch()
                    void outlets.refetch()
                }}
            />
        )
    }

    return (
        <>
            {suspended ? <SuspendedBanner /> : null}

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-primary">
                            {businessName[0]?.toUpperCase() ?? "M"}
                        </span>
                        <div className="flex min-w-0 flex-col">
                            <CardTitle className="truncate">{businessName}</CardTitle>
                            <CardDescription>
                                {presentation === null ? (
                                    "Memuat status usaha…"
                                ) : (
                                    <span className="flex items-center gap-1.5">
                                        <span
                                            aria-hidden="true"
                                            className={cn(
                                                "size-2 rounded-full",
                                                presentation.tone === "positive" && "bg-emerald-500",
                                                presentation.tone === "neutral" && "bg-muted-foreground",
                                                presentation.tone === "negative" && "bg-destructive"
                                            )}
                                        />
                                        {presentation.label}
                                    </span>
                                )}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {outlets.isError ? (
                        <ErrorState
                            title="Gagal memuat outlet"
                            description={getApiErrorMessage(outlets.error)}
                            onRetry={() => void outlets.refetch()}
                        />
                    ) : (
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 flex-col">
                                <Text variant="xl" weight="semibold">
                                    {outletTotal} outlet
                                </Text>
                                <Text variant="xs" className="text-muted-foreground">
                                    {outletTotal === 0
                                        ? "Tambahkan outlet pertama Anda"
                                        : "Kelola outlet, jam, dan area layanan"}
                                </Text>
                            </div>
                            <Button
                                render={
                                    <Link to={outletTotal === 0 ? SETTINGS_PATHS.outletNew : SETTINGS_PATHS.outlets} />
                                }
                                variant="outline"
                                size="sm"
                                className="shrink-0"
                            >
                                {outletTotal === 0 ? (
                                    <>
                                        <PlusIcon aria-hidden="true" />
                                        Tambah
                                    </>
                                ) : (
                                    "Kelola"
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <section className="flex flex-col gap-2">
                <Text as="h2" variant="sm" weight="semibold">
                    Jalan pintas
                </Text>
                <div className="grid grid-cols-2 gap-3">
                    {SHORTCUTS.map((item) => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="flex items-center gap-3 rounded-2xl border bg-card p-3 transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/60"
                        >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                                <item.icon className="size-4" aria-hidden="true" />
                            </span>
                            <span className="flex min-w-0 flex-col text-left">
                                <Text as="span" variant="sm" weight="medium" truncate>
                                    {item.label}
                                </Text>
                                <Text as="span" variant="xs" className="truncate text-muted-foreground">
                                    {item.description}
                                </Text>
                            </span>
                        </Link>
                    ))}
                </div>
            </section>
        </>
    )
}
