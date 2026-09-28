import type { LucideIcon } from "lucide-react"
import { Text } from "~/components/ui/text"

export function DetailRows({
    rows,
    title,
    description,
    icon: Icon,
}: {
    rows: Array<{ term: string; value: string }>
    title?: string
    description?: string
    icon?: LucideIcon
}) {
    const list = (
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
