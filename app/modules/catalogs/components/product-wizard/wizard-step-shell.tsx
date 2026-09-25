import type { ReactNode } from "react"

import { Text } from "~/components/ui/text"

export function WizardStepShell({
    title,
    description,
    children,
}: {
    title: string
    description?: string
    children: ReactNode
}) {
    return (
        <section className="flex flex-col gap-4">
            <div className="mb-4 flex flex-col gap-1">
                <Text as="h2" variant="lg" weight="bold">
                    {title}
                </Text>
                {description !== undefined ? (
                    <Text variant="sm" className="text-muted-foreground">
                        {description}
                    </Text>
                ) : null}
            </div>
            {children}
        </section>
    )
}
