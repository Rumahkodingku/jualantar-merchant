import { ArrowRightIcon, PauseCircleIcon, StoreIcon } from "lucide-react"
import { Link } from "react-router"

import { Card, CardContent } from "~/components/ui/card"
import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"
import type { OperationalOutlet } from "~/modules/merchant-operations"

/**
 * CTA operasional utama Home. Selalu mengarah ke `/orders`.
 *
 * TODO(outlet-context): teruskan konteks outlet terpilih ke Orders
 * setelah module Orders mendukung filter outlet — jangan mengarang
 * param API baru sebelum kontraknya ada.
 */
export function OperationalCta({ outlet, suspended }: { outlet: OperationalOutlet; suspended: boolean }) {
    const inactive = outlet.status === "inactive"
    const blocked = suspended || inactive

    return (
        <Card className={cn(blocked ? "border-destructive/30 bg-destructive/5" : "border-primary/20 bg-primary/5")}>
            <CardContent className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                    <span
                        className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-xl",
                            blocked ? "bg-destructive/10 text-destructive" : "bg-primary text-primary-foreground"
                        )}
                    >
                        {blocked ? (
                            <PauseCircleIcon className="size-5" aria-hidden="true" />
                        ) : (
                            <StoreIcon className="size-5" aria-hidden="true" />
                        )}
                    </span>
                    <div className="flex min-w-0 flex-col gap-0.5">
                        <Text as="h2" variant="base" weight="semibold">
                            {suspended
                                ? "Merchant ditangguhkan"
                                : inactive
                                  ? "Outlet sedang tidak aktif"
                                  : "Outlet sedang buka"}
                        </Text>
                        <Text variant="sm" className="text-muted-foreground">
                            {suspended
                                ? "Outlet tidak dapat menerima pesanan sampai merchant diaktifkan kembali."
                                : inactive
                                  ? "Aktifkan outlet agar dapat mulai menerima pesanan."
                                  : "Terima dan proses pesanan dengan cepat."}
                        </Text>
                    </div>
                </div>

                <Link
                    to="/orders"
                    aria-label={`Masuk ke Operasional ${outlet.name}`}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-all outline-none select-none hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px"
                >
                    Masuk ke Operasional
                    <ArrowRightIcon className="size-4" aria-hidden="true" />
                </Link>
            </CardContent>
        </Card>
    )
}
