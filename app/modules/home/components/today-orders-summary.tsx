import { Card, CardContent } from "~/components/ui/card"
import { Text } from "~/components/ui/text"
import type { TodayOrders } from "../types/home.types"

const ITEMS: { key: keyof TodayOrders; label: string; tone: string }[] = [
    { key: "new", label: "Pesanan Baru", tone: "bg-sky-500/10 text-sky-700 dark:text-sky-400" },
    { key: "processing", label: "Diproses", tone: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
    { key: "completed", label: "Selesai", tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
]

export function TodayOrdersSummary({ data }: { data: TodayOrders }) {
    return (
        <section aria-label="Pesanan hari ini" className="flex flex-col gap-2">
            <Text as="h2" variant="sm" weight="semibold">
                Pesanan Hari Ini
            </Text>
            <div className="grid grid-cols-3 gap-3">
                {ITEMS.map((item) => (
                    <Card key={item.key} size="sm">
                        <CardContent className="flex flex-col items-center gap-1 py-3 text-center">
                            <Text as="span" variant="xl" weight="semibold" className="tabular-nums">
                                {data[item.key]}
                            </Text>
                            <Text
                                as="span"
                                variant="xs"
                                weight="medium"
                                className={`rounded-full px-2 py-0.5 ${item.tone}`}
                            >
                                {item.label}
                            </Text>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    )
}
