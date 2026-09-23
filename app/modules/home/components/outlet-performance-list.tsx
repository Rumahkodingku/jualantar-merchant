import { ChevronRightIcon } from "lucide-react"

import { Card, CardContent } from "~/components/ui/card"
import { Text } from "~/components/ui/text"
import { outletStatusLabel } from "~/modules/merchant-operations"
import type { OutletPerformanceItem } from "../types/home.types"
import { formatIDR } from "../utils/home-format"

export function OutletPerformanceList({
    items,
    onSelect,
}: {
    items: OutletPerformanceItem[]
    onSelect: (outletId: string) => void
}) {
    return (
        <section aria-label="Performa outlet" className="flex flex-col gap-2">
            <Text as="h2" variant="sm" weight="semibold">
                Performa Outlet
            </Text>

            <Card>
                <CardContent className="flex flex-col gap-1">
                    {items.map((item) => (
                        <button
                            key={item.outletId}
                            type="button"
                            onClick={() => onSelect(item.outletId)}
                            aria-label={`Lihat ringkasan ${item.name}`}
                            className="flex min-h-11 items-center gap-3 rounded-xl py-2.5 text-left transition-colors outline-none hover:bg-muted/40 focus-visible:bg-muted/60"
                        >
                            <span
                                aria-hidden="true"
                                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary"
                            >
                                {item.name[0]?.toUpperCase() ?? "O"}
                            </span>
                            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                <Text as="span" variant="sm" weight="medium" truncate>
                                    {item.name}
                                </Text>
                                <Text as="span" variant="xs" className="truncate text-muted-foreground">
                                    {item.status === "active" ? "Buka" : outletStatusLabel(item.status)} • {item.orders}{" "}
                                    pesanan
                                </Text>
                            </span>
                            <span className="flex shrink-0 items-center gap-1">
                                <Text as="span" variant="sm" weight="semibold" className="tabular-nums">
                                    {formatIDR(item.sales)}
                                </Text>
                                <ChevronRightIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                            </span>
                        </button>
                    ))}
                </CardContent>
            </Card>
        </section>
    )
}
