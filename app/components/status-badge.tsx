import type { ReactNode } from "react"

import { Badge } from "~/components/ui/badge"
import { cn } from "~/lib/utils"

export type StatusTone = "positive" | "negative" | "neutral"

const TONE_CLASS: Record<StatusTone, string> = {
    positive: "border-transparent bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    negative: "border-transparent bg-destructive/10 text-destructive",
    neutral: "border-transparent bg-muted text-muted-foreground",
}

export function StatusBadge({
    tone,
    indicator,
    children,
    className,
}: {
    tone: StatusTone
    indicator?: string
    children: ReactNode
    className?: string
}) {
    return (
        <Badge variant="outline" className={cn(TONE_CLASS[tone], className)}>
            {indicator !== undefined ? <span aria-hidden="true">{indicator}</span> : null}
            {children}
        </Badge>
    )
}
