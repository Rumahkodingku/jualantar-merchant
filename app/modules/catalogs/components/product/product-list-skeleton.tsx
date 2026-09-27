import { Skeleton } from "~/components/ui/skeleton"

export function ProductListSkeleton({ rows = 4 }: { rows?: number }) {
    return (
        <div role="status" aria-busy="true" aria-label="Memuat" className="flex flex-col gap-3">
            {Array.from({ length: rows }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-center gap-3 rounded-xl border bg-card p-3 ring-1 ring-foreground/5"
                >
                    <Skeleton className="size-16 shrink-0 rounded-xl sm:size-20" />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <Skeleton className="h-4 w-2/5 rounded-md" />
                        <Skeleton className="h-3 w-1/4 rounded-md" />
                        <Skeleton className="h-4 w-1/3 rounded-md" />
                    </div>
                </div>
            ))}
        </div>
    )
}
