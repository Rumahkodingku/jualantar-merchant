import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart"
import { Text } from "~/components/ui/text"
import type { SalesPoint } from "../types/home.types"
import { formatCompactIDR, formatIDR } from "../utils/home-format"

const CHART_CONFIG = {
    sales: {
        label: "Penjualan",
        color: "var(--primary)",
    },
} as const

export function HomeSalesChart({ data }: { data: SalesPoint[] }) {
    const total = data.reduce((sum, point) => sum + point.value, 0)
    const summary = data.map((point) => `${point.label} ${formatIDR(point.value)}`).join(", ")

    return (
        <section aria-label="Ringkasan 7 hari terakhir" className="flex flex-col gap-2">
            <Card>
                <CardHeader>
                    <CardTitle>Ringkasan 7 Hari Terakhir</CardTitle>
                    <CardDescription>
                        Total{" "}
                        <Text as="span" variant="sm" weight="semibold" className="text-foreground tabular-nums">
                            {formatIDR(total)}
                        </Text>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={CHART_CONFIG} className="aspect-auto h-48 w-full">
                        <AreaChart data={data} margin={{ left: 0, right: 4, top: 4, bottom: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                            <YAxis
                                width={44}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={4}
                                tickFormatter={(value: number) => formatCompactIDR(value)}
                            />
                            <ChartTooltip
                                cursor={{ stroke: "var(--border)" }}
                                content={
                                    <ChartTooltipContent
                                        formatter={(value) => (
                                            <span className="font-mono font-medium tabular-nums">
                                                {formatIDR(Number(value))}
                                            </span>
                                        )}
                                    />
                                }
                            />
                            <Area
                                dataKey="value"
                                name="sales"
                                type="monotone"
                                fill="var(--color-sales)"
                                fillOpacity={0.2}
                                stroke="var(--color-sales)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ChartContainer>
                    <p className="sr-only"> tren penjualan harian: {summary}.</p>
                </CardContent>
            </Card>
        </section>
    )
}
