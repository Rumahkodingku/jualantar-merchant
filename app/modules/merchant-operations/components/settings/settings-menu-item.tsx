import { ChevronRightIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Link } from "react-router"

import { Badge } from "~/components/ui/badge"
import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

export function SettingsMenuItem({
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
            <span
                className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl",
                    disabled ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground"
                )}
            >
                <Icon className="size-4" aria-hidden="true" />
            </span>

            <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                <span className="flex items-center gap-2">
                    <Text as="span" variant="sm" weight="medium" truncate>
                        {label}
                    </Text>
                    {badge !== undefined ? <Badge variant="secondary">{badge}</Badge> : null}
                </span>
                {description !== undefined ? (
                    <Text as="span" variant="xs" className="leading-relaxed text-muted-foreground">
                        {description}
                    </Text>
                ) : null}
            </span>

            <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </>
    )

    if (disabled) {
        return (
            <div aria-disabled="true" className="flex min-h-14 w-full items-center gap-3 px-4 py-3 opacity-60">
                {content}
            </div>
        )
    }

    return (
        <Link
            to={to}
            className="flex min-h-14 w-full items-center gap-3 px-4 py-3 transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/60"
        >
            {content}
        </Link>
    )
}
