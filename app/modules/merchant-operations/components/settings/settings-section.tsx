import type { ReactNode } from "react"

import { Text } from "~/components/ui/text"

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="flex flex-col gap-2">
            <Text
                as="h2"
                variant="xs"
                weight="semibold"
                transform="uppercase"
                className="tracking-wide text-muted-foreground"
            >
                {title}
            </Text>
            <div className="flex flex-col divide-y overflow-hidden rounded-2xl border bg-card">{children}</div>
        </section>
    )
}
