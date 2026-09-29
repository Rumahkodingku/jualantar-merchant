import { StatusBadge as SharedStatusBadge } from "~/components/status-badge"
import { cn } from "~/lib/utils"

import { STATUS_LABEL, statusTone } from "../../utils/labels"
import type { CatalogStatus } from "../../types/catalog.types"

/**
 * The catalog's reading of a shared status on a label: a dot instead of an
 * emoji, and the red palette the catalog screens were designed against.
 *
 * The tone classes are passed through rather than folded into the shared badge
 * so the catalog keeps its exact colours while still reusing the shared
 * component's markup.
 */
export function StatusBadge({ status, className }: { status: CatalogStatus; className?: string }) {
    return (
        <SharedStatusBadge
            tone={statusTone(status)}
            indicator={<span className="size-1.5 rounded-full bg-current" />}
            className={cn(
                "gap-1.5",
                statusTone(status) === "positive"
                    ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                    : "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-400",
                className
            )}
        >
            {STATUS_LABEL[status]}
        </SharedStatusBadge>
    )
}
