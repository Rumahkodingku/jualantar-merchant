import { BoxesIcon, ImagesIcon, StoreIcon, UtensilsCrossedIcon, type LucideIcon } from "lucide-react"
import { Text } from "~/components/ui/text"
import type { ProductDetailTab } from "./product-detail-tabs"
import type { ProductDetailSummary } from "../../types"

export function ProductSummaryMetrics({
    summary,
    onSelectTab,
}: {
    summary: ProductDetailSummary
    onSelectTab: (tab: ProductDetailTab) => void
}) {
    const metrics: Array<{
        tab: ProductDetailTab
        icon: LucideIcon
        label: string
        value: number
        description: string
    }> = [
        {
            tab: "variant",
            icon: BoxesIcon,
            label: "Variant",
            value: summary.variants_count,
            description: "Pilihan produk",
        },
        {
            tab: "customization",
            icon: UtensilsCrossedIcon,
            label: "Customization",
            value: summary.customization_groups_count,
            description: "Tambahan pilihan",
        },
        {
            tab: "media",
            icon: ImagesIcon,
            label: "Media",
            value: summary.media_count,
            description: "Foto produk",
        },
        {
            tab: "outlet",
            icon: StoreIcon,
            label: "Outlet",
            value: summary.outlets_count,
            description: "Outlet yang tersedia",
        },
    ]

    return (
        <div className="grid grid-cols-2 gap-3">
            {metrics.map((metric) => {
                const Icon = metric.icon

                return (
                    <button
                        key={metric.tab}
                        type="button"
                        onClick={() => onSelectTab(metric.tab)}
                        className="flex flex-col gap-1 rounded-2xl border bg-card p-4 text-left transition-colors outline-none hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                        <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
                        <div className="flex flex-col items-start gap-2">
                            <Text variant="lg" weight="semibold" className="tabular-nums">
                                {metric.value}
                            </Text>
                            <Text variant="xs" weight="medium">
                                {metric.label}
                            </Text>
                        </div>
                        {/* <Text variant="xs" className="text-muted-foreground">
                            {metric.description}
                        </Text> */}
                    </button>
                )
            })}
        </div>
    )
}
