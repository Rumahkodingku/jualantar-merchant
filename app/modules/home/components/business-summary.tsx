import { StarIcon } from "lucide-react"

import { Card, CardContent } from "~/components/ui/card"
import { Text } from "~/components/ui/text"
import type { BusinessSummary } from "../types/home.types"
import { formatIDR, formatRating } from "../utils/home-format"

export function HomeBusinessSummary({ data, caption }: { data: BusinessSummary; caption: string }) {
    return (
        <section aria-label="Ringkasan hari ini" className="flex flex-col gap-2">
            <Text as="h2" variant="sm" weight="semibold">
                Ringkasan Hari Ini
            </Text>
            <div className="grid grid-cols-2 gap-3">
                <Card size="sm">
                    <CardContent className="flex flex-col gap-0.5 py-3">
                        <Text as="span" variant="xs" className="text-muted-foreground">
                            Total Pesanan
                        </Text>
                        <Text as="span" variant="xl" weight="semibold" className="tabular-nums">
                            {data.totalOrders}
                        </Text>
                    </CardContent>
                </Card>
                <Card size="sm">
                    <CardContent className="flex flex-col gap-0.5 py-3">
                        <Text as="span" variant="xs" className="text-muted-foreground">
                            Total Penjualan
                        </Text>
                        <Text as="span" variant="xl" weight="semibold" className="truncate tabular-nums">
                            {formatIDR(data.sales)}
                        </Text>
                    </CardContent>
                </Card>
                <Card size="sm">
                    <CardContent className="flex flex-col gap-0.5 py-3">
                        <Text as="span" variant="xs" className="text-muted-foreground">
                            Produk Terjual
                        </Text>
                        <Text as="span" variant="xl" weight="semibold" className="tabular-nums">
                            {data.productsSold}
                        </Text>
                    </CardContent>
                </Card>
                <Card size="sm">
                    <CardContent className="flex flex-col gap-0.5 py-3">
                        <Text as="span" variant="xs" className="text-muted-foreground">
                            Rating Outlet
                        </Text>
                        <Text as="span" variant="xl" weight="semibold" className="flex items-center gap-1 tabular-nums">
                            <StarIcon className="size-4 fill-amber-400 text-amber-400" aria-hidden="true" />
                            {formatRating(data.rating)}
                        </Text>
                    </CardContent>
                </Card>
            </div>
            <Text variant="xs" className="text-muted-foreground">
                {caption}
            </Text>
        </section>
    )
}
