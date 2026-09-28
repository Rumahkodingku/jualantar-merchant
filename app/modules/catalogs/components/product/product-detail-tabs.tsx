import { TabsList, TabsTrigger } from "~/components/ui/tabs"

import type { ProductDetailSummary } from "../../types/catalog.types"
import { Text } from "~/components/ui/text"

export const PRODUCT_DETAIL_TABS = [
    { value: "ringkasan", label: "Ringkasan" },
    { value: "variant", label: "Variant" },
    { value: "customization", label: "Customization" },
    { value: "media", label: "Media" },
    { value: "outlet", label: "Outlet" },
] as const

export type ProductDetailTab = (typeof PRODUCT_DETAIL_TABS)[number]["value"]

export function ProductDetailTabList({ summary }: { summary: ProductDetailSummary }) {
    const counts: Partial<Record<ProductDetailTab, number>> = {
        variant: summary.variants_count,
        customization: summary.customization_groups_count,
        media: summary.media_count,
        outlet: summary.outlets_count,
    }

    return (
        <TabsList
            variant="line"
            className="no-scrollbar h-11 w-full justify-start gap-1 overflow-x-auto overflow-y-hidden pb-4"
        >
            {PRODUCT_DETAIL_TABS.map((tab) => {
                const count = counts[tab.value]

                return (
                    <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        aria-label={count === undefined ? tab.label : `${tab.label}, ${count} item`}
                        className="flex-none shrink-0 gap-1.5 px-3 py-4 transition-colors hover:text-primary data-active:font-medium data-active:text-primary! data-active:after:bg-primary!"
                    >
                        <Text variant="sm" weight="semibold">
                            {tab.label}
                        </Text>
                        {count !== undefined ? (
                            <span className="min-w-5 rounded-full bg-muted px-1.5 text-center text-xs tabular-nums">
                                {count}
                            </span>
                        ) : null}
                    </TabsTrigger>
                )
            })}
        </TabsList>
    )
}
