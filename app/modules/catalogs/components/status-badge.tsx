import { Badge } from "~/components/ui/badge"
import { cn } from "~/lib/utils"

import { STATUS_LABEL, statusTone } from "../utils/labels"
import type { CatalogStatus } from "../types/catalog.types"

export function StatusBadge({ status, className }: { status: CatalogStatus; className?: string }) {
    const tone = statusTone(status)

    return (
        <Badge
            variant="outline"
            className={cn(
                "gap-1.5 border-transparent",
                tone === "positive"
                    ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground",
                className
            )}
        >
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            {STATUS_LABEL[status]}
        </Badge>
    )
}
