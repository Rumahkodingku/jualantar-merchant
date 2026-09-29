import { AspectRatio } from "~/components/ui/aspect-ratio"
import { Text } from "~/components/ui/text"
import { ProductDetailTabList, type ProductDetailTab } from "./product-detail-tabs"
import { MediaThumbnail } from "../common/media-thumbnail"
import { ProductSummaryMetrics } from "./product-summary-metrics"
import { sortByDisplayOrder } from "../../utils/media-order"
import { formatSummaryPrice } from "../../utils/product-price"
import type { ProductDetail } from "../../types"

export function ProductSummary({
    product,
    onSelectTab,
}: {
    product: ProductDetail
    onSelectTab: (tab: ProductDetailTab) => void
}) {
    const media = sortByDisplayOrder(product.media ?? [])
    const primaryMedia = media.find((item) => item.is_primary) ?? media[0] ?? null
    const heroSrc = product.primary_media?.url ?? primaryMedia?.url ?? null
    const heroAlt = product.primary_media?.alt_text ?? primaryMedia?.alt_text ?? product.name
    const price = formatSummaryPrice(product.summary.price)

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-4">
                <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-2xl border bg-muted">
                    <MediaThumbnail src={heroSrc} alt={heroAlt} className="size-full" />
                </AspectRatio>

                <div className="flex flex-col gap-1">
                    <Text as="h2" variant="xl" weight="bold" className="tracking-tight">
                        {product.name}
                    </Text>
                    <Text variant="sm" weight="normal">
                        {price}
                    </Text>
                    {product.description !== null && product.description !== "" ? (
                        <Text variant="sm" className="mt-2 text-muted-foreground">
                            {product.description}
                        </Text>
                    ) : null}
                </div>
            </div>

            <ProductSummaryMetrics summary={product.summary} onSelectTab={onSelectTab} />

            <ProductDetailTabList summary={product.summary} />
        </div>
    )
}
