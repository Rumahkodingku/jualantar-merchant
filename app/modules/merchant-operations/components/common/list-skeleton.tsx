import { Skeleton } from "~/components/ui/skeleton"

export function ListSkeleton({ rows = 3, className = "h-24" }: { rows?: number; className?: string }) {
    return (
        <div className="flex flex-col gap-3">
            {Array.from({ length: rows }).map((_, index) => (
                <Skeleton key={index} className={`w-full rounded-2xl ${className}`} />
            ))}
        </div>
    )
}
