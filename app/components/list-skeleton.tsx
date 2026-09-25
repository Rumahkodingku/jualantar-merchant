import { Skeleton } from "~/components/ui/skeleton"
import { cn } from "~/lib/utils"

export function ListSkeleton({
    rows = 4,
    className = "h-24",
    layout = "stack",
}: {
    rows?: number
    className?: string
    layout?: "stack" | "grid"
}) {
    return (
        <div
            role="status"
            aria-busy="true"
            aria-label="Memuat"
            className={cn(layout === "grid" ? "grid grid-cols-1 gap-3 md:grid-cols-2" : "flex flex-col gap-3")}
        >
            {Array.from({ length: rows }).map((_, index) => (
                <Skeleton key={index} className={`w-full rounded-2xl ${className}`} />
            ))}
        </div>
    )
}
