import { cn } from "cn"
import type { ReactNode } from "react"
import { Text } from "./ui/text"

type PageHeaderProps = {
    title: string
    description?: string
    action?: ReactNode
    className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
    return (
        <header className={cn("flex flex-col gap-1", className)}>
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <Text as="h1" variant="2xl" weight="bold" className="tracking-tight">
                        {title}
                    </Text>

                    {description && (
                        <Text variant="sm" className="text-muted-foreground">
                            {description}
                        </Text>
                    )}
                </div>

                {action && <div className="shrink-0">{action}</div>}
            </div>
        </header>
    )
}
