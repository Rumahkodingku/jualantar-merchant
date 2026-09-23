import { type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Text } from "~/components/ui/text"

export function MenuSection({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon?: LucideIcon | null
    title: string
    description?: string
    children: ReactNode
}) {
    return (
        <section className="flex min-w-0 flex-col gap-3">
            <div className="flex min-w-0 items-center gap-3 px-1">
                {Icon && <Icon className="size-5 shrink-0 text-muted-foreground" strokeWidth={2} aria-hidden="true" />}

                <div className="min-w-0">
                    <Text as="h2" variant="xs" weight="bold" className="text-foreground uppercase">
                        {title}
                    </Text>

                    {description && (
                        <Text as="p" variant="xs" weight="medium" className="mt-0.5 text-muted-foreground">
                            {description}
                        </Text>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-0 divide-y overflow-hidden rounded-2xl border">{children}</div>
        </section>
    )
}
