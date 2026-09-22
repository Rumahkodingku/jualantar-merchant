import { StoreIcon } from "lucide-react"

import { Text } from "~/components/ui/text"

import { StatusBadge } from "../common/status-badge"
import { outletStatusLabel } from "../../utils/outlet-status"
import { outletServiceAreaSummary } from "../../utils/service-area-summary"
import type { OperationalOutlet } from "../../types/merchant-operations.types"

export function OutletCompactHeader({ outlet }: { outlet: OperationalOutlet }) {
    const photoUrl = outlet.photos_url[0] ?? null

    return (
        <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
            <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted text-muted-foreground">
                {photoUrl !== null ? (
                    <img src={photoUrl} alt={`Foto ${outlet.name}`} className="size-full object-cover" />
                ) : (
                    <StoreIcon className="size-5" aria-hidden="true" />
                )}
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Text variant="sm" weight="semibold" truncate>
                    {outlet.name}
                </Text>
                <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge tone={outlet.status === "active" ? "positive" : "neutral"}>
                        {outletStatusLabel(outlet.status)}
                    </StatusBadge>
                    <Text as="span" variant="xs" className="text-muted-foreground">
                        {outletServiceAreaSummary(outlet)}
                    </Text>
                </div>
            </div>
        </div>
    )
}
