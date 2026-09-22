import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "~/components/ui/empty"

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon: LucideIcon
    title: string
    description?: string
    action?: ReactNode
}) {
    return (
        <Empty className="border">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <Icon aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>{title}</EmptyTitle>
                {description !== undefined ? <EmptyDescription>{description}</EmptyDescription> : null}
            </EmptyHeader>
            {action !== undefined ? <EmptyContent>{action}</EmptyContent> : null}
        </Empty>
    )
}
