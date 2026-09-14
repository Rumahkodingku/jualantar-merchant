import { Spinner } from "~/components/ui/spinner"

export function FullScreenLoader({ label = "Memuat…" }: { label?: string }) {
    return (
        <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center gap-3 bg-background">
            <Spinner className="size-6 text-primary" />
            <p className="text-sm text-muted-foreground">{label}</p>
        </div>
    )
}
