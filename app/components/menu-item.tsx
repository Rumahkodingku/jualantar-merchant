import { ChevronRightIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Link } from "react-router"

import { Badge } from "~/components/ui/badge"
import { Text } from "~/components/ui/text"

export function MenuItem({
    to,
    icon: Icon,
    label,
    description,
    badge,
    disabled = false,
}: {
    to: string
    icon: LucideIcon
    label: string
    description?: string
    badge?: string
    disabled?: boolean
}) {
    const content = (
        <>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-muted-foreground">
                <Icon className="size-4" aria-hidden="true" />
            </span>

            <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                <span className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <Text as="span" variant="sm" weight="semibold" className="break-words">
                        {label}
                    </Text>
                    {badge !== undefined ? (
                        <Badge variant="secondary" className="shrink-0">
                            {badge}
                        </Badge>
                    ) : null}
                </span>
                {description !== undefined ? (
                    <Text
                        as="span"
                        variant="xs"
                        weight="medium"
                        className="leading-relaxed break-words text-muted-foreground"
                    >
                        {description}
                    </Text>
                ) : null}
            </span>

            {disabled ? null : (
                <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground/70" aria-hidden="true" />
            )}
        </>
    )

    if (disabled) {
        return (
            <div
                aria-disabled="true"
                className="flex min-h-14 w-full items-center gap-3 border-none px-4 py-3 opacity-65"
            >
                {content}
            </div>
        )
    }

    return (
        <Link
            to={to}
            className="flex min-h-14 w-full items-center gap-3 border-none px-4 py-3 transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset"
        >
            {content}
        </Link>
    )
}
