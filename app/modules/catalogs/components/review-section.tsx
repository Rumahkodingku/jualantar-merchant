import { ChevronDownIcon } from "lucide-react"

import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

export function ReviewSection({
    title,
    summary,
    expanded,
    onToggle,
    headerAction,
    children,
}: {
    title: string
    summary?: string
    expanded: boolean
    onToggle: () => void
    headerAction?: React.ReactNode
    children?: React.ReactNode
}) {
    return (
        <div className="rounded-2xl border bg-card ring-1 ring-foreground/5">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={onToggle}
                    className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                    <span className="flex min-w-0 flex-col gap-0.5">
                        <Text as="span" variant="sm" weight="semibold">
                            {title}
                        </Text>
                        {!expanded && summary != null && summary !== "" ? (
                            <Text as="span" variant="xs" className="truncate text-muted-foreground">
                                {summary}
                            </Text>
                        ) : null}
                    </span>
                    <ChevronDownIcon
                        aria-hidden="true"
                        className={cn(
                            "size-4 shrink-0 text-muted-foreground transition-transform",
                            expanded && "rotate-180"
                        )}
                    />
                </button>

                {headerAction !== undefined && !expanded ? <div className="pr-3">{headerAction}</div> : null}
            </div>

            {expanded ? <div className="border-t px-4 py-4">{children}</div> : null}
        </div>
    )
}
