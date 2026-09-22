import { SearchIcon } from "lucide-react"

import { Input } from "~/components/ui/input"
import { cn } from "~/lib/utils"

import type { OutletStatus } from "../../types/merchant-operations.types"

export type StatusFilter = OutletStatus | "all"

const FILTERS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "Semua" },
    { value: "active", label: "Aktif" },
    { value: "inactive", label: "Nonaktif" },
]

export function OutletFilters({
    search,
    onSearchChange,
    status,
    onStatusChange,
}: {
    search: string
    onSearchChange: (value: string) => void
    status: StatusFilter
    onStatusChange: (value: StatusFilter) => void
}) {
    return (
        <div className="flex flex-col gap-3">
            <div className="relative">
                <SearchIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                    type="search"
                    className="h-11 pl-10"
                    placeholder="Cari nama outlet"
                    aria-label="Cari outlet"
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                />
            </div>

            <div role="group" aria-label="Filter status outlet" className="flex gap-2">
                {FILTERS.map((filter) => {
                    const active = filter.value === status

                    return (
                        <button
                            key={filter.value}
                            type="button"
                            aria-pressed={active}
                            onClick={() => onStatusChange(filter.value)}
                            className={cn(
                                "h-9 flex-1 rounded-xl border text-sm font-medium transition-colors outline-none",
                                "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                                active
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                            )}
                        >
                            {filter.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
