import { AlertTriangleIcon, RotateCcwIcon } from "lucide-react"

import { Button } from "~/components/ui/button"

export function ErrorState({
    title = "Terjadi kesalahan",
    description,
    onRetry,
    retryLabel = "Coba lagi",
}: {
    title?: string
    description?: string
    onRetry?: () => void
    retryLabel?: string
}) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <AlertTriangleIcon className="size-6" />
            </div>
            <div className="flex flex-col gap-1.5">
                <h2 className="font-heading text-base font-semibold">{title}</h2>
                {description !== undefined ? (
                    <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                ) : null}
            </div>
            {onRetry !== undefined ? (
                <Button variant="outline" onClick={onRetry}>
                    <RotateCcwIcon /> {retryLabel}
                </Button>
            ) : null}
        </div>
    )
}
