import { MapPinIcon, StoreIcon } from "lucide-react"
import { Link } from "react-router"

import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

import { StatusBadge } from "../common/status-badge"
import { outletServiceAreaSummary } from "../../utils/service-area-summary"
import { outletStatusLabel } from "../../utils/outlet-status"
import type { OperationalOutlet } from "../../types/merchant-operations.types"

const CARD_CLASS =
    "flex w-full gap-3 rounded-2xl border bg-card p-3 text-left transition-colors outline-none hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

function OutletCardBody({ outlet }: { outlet: OperationalOutlet }) {
    const photoUrl = outlet.photos_url[0] ?? null
    const isActive = outlet.status === "active"
    const location = [outlet.geography?.village, outlet.geography?.regency].filter(Boolean).join(", ")

    return (
        <>
            <span className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted text-muted-foreground">
                {photoUrl !== null ? (
                    <img src={photoUrl} alt={`Foto ${outlet.name}`} className="size-full object-cover" />
                ) : (
                    <StoreIcon className="size-6" aria-hidden="true" />
                )}
            </span>

            <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-start justify-between gap-2">
                    <Text as="span" variant="sm" weight="semibold" truncate className="min-w-0">
                        {outlet.name}
                    </Text>
                    <StatusBadge tone={isActive ? "positive" : "neutral"}>
                        {outletStatusLabel(outlet.status)}
                    </StatusBadge>
                </span>

                <span className="flex items-start gap-1 text-xs leading-relaxed text-muted-foreground">
                    <MapPinIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                    <span className="min-w-0">
                        {outlet.address}
                        {location !== "" ? `, ${location}` : ""}
                    </span>
                </span>

                <Text as="span" variant="xs" className="text-muted-foreground">
                    {outletServiceAreaSummary(outlet)}
                </Text>
            </span>
        </>
    )
}

export function OutletCard({ outlet, to, onClick }: { outlet: OperationalOutlet; to?: string; onClick?: () => void }) {
    if (to !== undefined) {
        return (
            <Link to={to} className={cn(CARD_CLASS)}>
                <OutletCardBody outlet={outlet} />
            </Link>
        )
    }

    return (
        <button type="button" onClick={onClick} className={cn(CARD_CLASS)}>
            <OutletCardBody outlet={outlet} />
        </button>
    )
}
