import type { LucideIcon } from "lucide-react"
import { Text } from "~/components/ui/text"

/**
 * A term-and-value list, the shape most of the catalog's read-only views take.
 *
 * Two framings, because the two places it appears frame it differently and
 * neither is wrong: `plain` is an open list that follows the section heading,
 * `boxed` is a self-contained card sitting inside a panel — which is how the
 * wizard's review step shows the merchant the values they are about to save.
 */
export function DetailRows({
    rows,
    title,
    description,
    icon: Icon,
    variant = "plain",
}: {
    rows: Array<{ term: string; value: string }>
    title?: string
    description?: string
    icon?: LucideIcon
    variant?: "plain" | "boxed"
}) {
    const list =
        variant === "boxed" ? (
            <dl className="flex flex-col divide-y rounded-xl border">
                {rows.map((row) => (
                    <div key={row.term} className="flex items-start justify-between gap-4 px-3 py-2">
                        <dt className="shrink-0 text-sm text-muted-foreground">{row.term}</dt>
                        <dd className="text-right text-sm font-medium wrap-break-word">{row.value}</dd>
                    </div>
                ))}
            </dl>
        ) : (
            <dl className="flex flex-col overflow-hidden">
                {rows.map((row) => (
                    <div key={row.term} className="flex items-start justify-between gap-4 py-3">
                        <Text variant="sm" weight="medium" className="shrink-0 text-muted-foreground">
                            {row.term}
                        </Text>
                        <Text variant="sm" weight="semibold" className="text-right wrap-break-word">
                            {row.value}
                        </Text>
                    </div>
                ))}
            </dl>
        )

    if (title === undefined) {
        return list
    }

    return (
        <section className="flex flex-col gap-3">
            <div>
                <div className="flex items-center gap-2">
                    {Icon !== undefined ? <Icon aria-hidden="true" className="size-4 text-muted-foreground" /> : null}
                    <Text as="h2" variant="base" weight="bold">
                        {title}
                    </Text>
                </div>
                <Text as="p" variant="xs" className="mt-1 text-muted-foreground">
                    {description}
                </Text>
            </div>
            {list}
        </section>
    )
}
