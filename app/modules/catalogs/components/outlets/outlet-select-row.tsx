import type { ReactNode } from "react"

import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

import type { CatalogOutlet } from "../../types"

/**
 * One outlet in a "which outlets carry this product?" list, with the control
 * the caller wants on the trailing edge.
 *
 * The wizard asks with a checkbox — many outlets, pick several — while the
 * assignment dialog asks with a switch. The row around it is identical, so
 * only the control is passed in.
 */
export function OutletSelectRow({
    outlet,
    isAssigned,
    control,
    className,
}: {
    outlet: CatalogOutlet
    isAssigned: boolean
    control: ReactNode
    /** The two callers space the row differently; both are kept as-is. */
    className?: string
}) {
    return (
        <label
            className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 hover:bg-muted/50",
                className
            )}
        >
            <span className="flex min-w-0 flex-col">
                <Text variant="sm" weight="medium" truncate>
                    {outlet.name}
                </Text>
                <Text variant="xs" className="text-muted-foreground">
                    {isAssigned ? "Ditugaskan" : "Tidak ditugaskan"}
                </Text>
            </span>
            {control}
        </label>
    )
}
