import { Badge } from "~/components/ui/badge"
import { cn } from "~/lib/utils"

import { AVAILABILITY_LABEL, availabilityTone } from "../../utils/labels"
import type { AvailabilityStatus } from "../../types/catalog.types"

export function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
    return (
        <Badge
            variant="outline"
            className={cn(
                "gap-1.5 border-transparent",
                availabilityTone(status) === "positive"
                    ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
            )}
        >
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            {AVAILABILITY_LABEL[status]}
        </Badge>
    )
}
