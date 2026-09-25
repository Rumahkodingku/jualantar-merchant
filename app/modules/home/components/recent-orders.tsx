import { ChevronRightIcon } from "lucide-react"
import { Link } from "react-router"

import { Card, CardContent } from "~/components/ui/card"
import { Text } from "~/components/ui/text"
import { StatusBadge } from "~/components/status-badge"
import type { RecentOrder, RecentOrderStatus } from "../types/home.types"
import { formatIDR } from "../utils/home-format"

const STATUS_META: Record<RecentOrderStatus, { label: string; tone: "positive" | "neutral" | "negative" }> = {
    new: { label: "Baru", tone: "negative" },
    processing: { label: "Diproses", tone: "neutral" },
    completed: { label: "Selesai", tone: "positive" },
}

export function RecentOrders({ orders }: { orders: RecentOrder[] }) {
    return (
        <section aria-label="Pesanan terbaru" className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
                <Text as="h2" variant="sm" weight="semibold">
                    Pesanan Terbaru
                </Text>
                <Link
                    to="/orders"
                    className="inline-flex min-h-11 items-center gap-0.5 rounded-lg px-2 text-sm font-medium text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                    Lihat semua
                    <ChevronRightIcon className="size-4" aria-hidden="true" />
                </Link>
            </div>

            <Card>
                <CardContent className="flex flex-col gap-1">
                    {orders.map((order) => {
                        const meta = STATUS_META[order.status]

                        return (
                            <Link
                                key={order.id}
                                to="/orders"
                                className="flex items-center gap-3 rounded-xl py-2.5 transition-colors outline-none hover:bg-muted/40 focus-visible:bg-muted/60"
                            >
                                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                    <Text as="span" variant="sm" weight="medium" truncate>
                                        {order.customerName}
                                    </Text>
                                    <Text as="span" variant="xs" className="truncate text-muted-foreground">
                                        {order.id} • {order.itemCount} item • {order.createdAt}
                                    </Text>
                                </span>
                                <span className="flex shrink-0 flex-col items-end gap-1">
                                    <Text as="span" variant="sm" weight="semibold" className="tabular-nums">
                                        {formatIDR(order.total)}
                                    </Text>
                                    <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                                </span>
                            </Link>
                        )
                    })}
                </CardContent>
            </Card>
        </section>
    )
}
