import { ChevronRightIcon } from "lucide-react"
import { Link } from "react-router"

import { Card, CardContent } from "~/components/ui/card"
import { Text } from "~/components/ui/text"
import { outletPath, outletStatusLabel, StatusBadge, type OperationalOutlet } from "~/modules/merchant-operations"

function outletPhoto(outlet: OperationalOutlet): string | null {
    const fromUrls = outlet.photos_url.find((photo) => photo !== null && photo !== "")

    return fromUrls ?? null
}

function OutletIdentity({ outlet, compact = false }: { outlet: OperationalOutlet; compact?: boolean }) {
    const photo = outletPhoto(outlet)

    return (
        <span className="flex min-w-0 flex-1 items-center gap-3">
            {photo === null ? (
                <span
                    aria-hidden="true"
                    className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-primary"
                >
                    {outlet.name[0]?.toUpperCase() ?? "O"}
                </span>
            ) : (
                <img
                    src={photo}
                    alt={`Foto ${outlet.name}`}
                    loading="lazy"
                    className="size-12 shrink-0 rounded-xl object-cover"
                />
            )}
            <span className="flex min-w-0 flex-1 flex-col gap-1 text-left">
                <Text as="span" variant={compact ? "sm" : "base"} weight="semibold" truncate>
                    {outlet.name}
                </Text>
                <span className="flex items-center gap-1.5">
                    <StatusBadge tone={outlet.status === "active" ? "positive" : "neutral"}>
                        {outlet.status === "active" ? "Buka" : outletStatusLabel(outlet.status)}
                    </StatusBadge>
                </span>
                <Text as="span" variant="xs" className="truncate text-muted-foreground">
                    {outlet.address}
                </Text>
            </span>
        </span>
    )
}

export function OutletContextCard({ outlet }: { outlet: OperationalOutlet }) {
    return (
        <Card>
            <CardContent>
                <Link
                    to={outletPath(outlet.id)}
                    aria-label={`Kelola ${outlet.name}`}
                    className="flex items-center gap-2 rounded-xl transition-colors outline-none hover:bg-muted/40 focus-visible:bg-muted/60"
                >
                    <OutletIdentity outlet={outlet} />
                    <ChevronRightIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
            </CardContent>
        </Card>
    )
}

export function AllOutletsCard({ total }: { total: number }) {
    return (
        <Card>
            <CardContent className="flex items-center gap-3">
                <span
                    aria-hidden="true"
                    className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-primary"
                >
                    {total}
                </span>
                <span className="flex min-w-0 flex-1 flex-col text-left">
                    <Text as="span" variant="base" weight="semibold" truncate>
                        Semua Outlet ({total})
                    </Text>
                    <Text as="span" variant="xs" className="text-muted-foreground">
                        Ringkasan gabungan seluruh outlet Anda
                    </Text>
                </span>
            </CardContent>
        </Card>
    )
}
