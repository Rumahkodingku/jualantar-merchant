import { ArrowLeftIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

export function ScreenHeader({
    title,
    description,
    onBack,
    action,
    children,
    className,
}: {
    title?: React.ReactNode
    description?: React.ReactNode
    onBack?: () => void
    action?: React.ReactNode
    children?: React.ReactNode
    className?: string
}) {
    return (
        <header className={cn("sticky top-0 z-20 border-b bg-background/85 backdrop-blur-md", className)}>
            <div className="flex items-center gap-2 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
                {onBack !== undefined ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        aria-label="Kembali"
                        className="-ml-2 shrink-0"
                    >
                        <ArrowLeftIcon />
                    </Button>
                ) : null}
                <div className="min-w-0 flex-1">
                    {title !== undefined ? (
                        <h1 className="truncate font-heading text-base leading-tight font-semibold">{title}</h1>
                    ) : null}
                    {description !== undefined ? (
                        <p className="truncate text-xs text-muted-foreground">{description}</p>
                    ) : null}
                </div>
                {action}
            </div>
            {children}
        </header>
    )
}
