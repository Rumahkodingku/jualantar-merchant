import type { ReactNode } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { cn } from "~/lib/utils"

import { StatusBadge, type StatusTone } from "./status-badge"

const TONE_ICON_CLASS: Record<StatusTone, string> = {
    positive: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    negative: "bg-destructive/10 text-destructive",
    neutral: "bg-muted text-muted-foreground",
}

export function StatusHeroCard({
    indicator,
    title,
    description,
    tone,
    badgeLabel,
    children,
}: {
    indicator: string
    title: string
    description: string
    tone: StatusTone
    badgeLabel: string
    children?: ReactNode
}) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <span
                        aria-hidden="true"
                        className={cn(
                            "flex size-12 shrink-0 items-center justify-center rounded-2xl text-2xl",
                            TONE_ICON_CLASS[tone]
                        )}
                    >
                        {indicator}
                    </span>
                    <div className="flex min-w-0 flex-col gap-1">
                        <CardTitle>{title}</CardTitle>
                        <StatusBadge tone={tone} className="w-fit">
                            {badgeLabel}
                        </StatusBadge>
                    </div>
                </div>
                <CardDescription className="leading-relaxed">{description}</CardDescription>
            </CardHeader>
            {children !== undefined ? <CardContent className="flex flex-col gap-3">{children}</CardContent> : null}
        </Card>
    )
}
