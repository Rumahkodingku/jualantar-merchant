import type { ReactNode } from "react"

import { Text } from "~/components/ui/text"

export function MenuSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="flex min-w-0 flex-col gap-2">
            <Text as="h2" variant="sm" weight="semibold" className="text-muted-foreground">
                {title}
            </Text>
            <div className="flex flex-col divide-y overflow-hidden">{children}</div>
        </section>
    )
}
