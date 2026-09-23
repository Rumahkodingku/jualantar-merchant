import { Skeleton } from "~/components/ui/skeleton"

export function HomeSkeleton() {
    return (
        <div className="flex flex-col gap-4" aria-label="Memuat beranda">
            <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-7 w-44 rounded-lg" />
                <div className="flex items-center gap-2">
                    <Skeleton className="size-11 rounded-full" />
                    <Skeleton className="size-8 rounded-full" />
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-7 w-56 rounded-lg" />
            </div>
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
            </div>
            <Skeleton className="h-56 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
    )
}
