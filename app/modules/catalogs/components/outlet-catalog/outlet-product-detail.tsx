import { Badge } from "~/components/ui/badge"
import { Text } from "~/components/ui/text"

import { MediaThumbnail } from "../common/media-thumbnail"
import { StatusBadge } from "../common/status-badge"
import { ProductCustomizationView } from "../product-detail/product-customization-view"
import { OutletProductOutletState } from "./outlet-product-outlet-state"
import { OutletVariantList } from "./outlet-variant-list"
import { formatCurrency } from "../../utils/format-currency"
import { PRODUCT_TYPE_LABEL } from "../../utils/labels"
import type { OutletCatalogItem } from "../../types"

/**
 * Presentation of a single product inside one outlet's catalog. Read-only
 * identity plus the outlet-scoped operations (availability, assignment status).
 * No master administration controls are rendered here.
 */
export function OutletProductDetail({
    item,
    outletId,
    outletLabel,
    canUpdateAvailability,
    canUpdateAssignmentStatus,
}: {
    item: OutletCatalogItem
    outletId: string
    outletLabel: string
    canUpdateAvailability: boolean
    canUpdateAssignmentStatus: boolean
}) {
    const isVariable = item.product.product_type === "variable"
    const activePrices = item.variants.filter((variant) => variant.status === "active").map((variant) => variant.price)
    const priceLabel = isVariable
        ? activePrices.length > 0
            ? `Mulai dari ${formatCurrency(Math.min(...activePrices))}`
            : "Lihat varian"
        : formatCurrency(item.product.price)

    return (
        <div className="flex flex-col gap-5">
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-muted">
                <MediaThumbnail
                    src={item.primary_media?.url ?? null}
                    alt={item.primary_media?.alt_text ?? item.product.name}
                />
            </div>

            <div className="flex flex-col gap-2">
                <Text as="h1" variant="lg" weight="bold">
                    {item.product.name}
                </Text>

                <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={item.product.status} />
                    {item.category !== null ? <Badge variant="outline">{item.category.name}</Badge> : null}
                    <Badge variant="outline">{PRODUCT_TYPE_LABEL[item.product.product_type]}</Badge>
                </div>

                <Text variant="base" weight="semibold" className="tabular-nums">
                    {priceLabel}
                </Text>

                {item.product.description !== null && item.product.description !== "" ? (
                    <Text variant="sm" className="leading-relaxed text-muted-foreground">
                        {item.product.description}
                    </Text>
                ) : null}
            </div>

            <OutletProductOutletState
                item={item}
                productId={item.product.id}
                outletId={outletId}
                outletLabel={outletLabel}
                canUpdateAvailability={canUpdateAvailability}
                canUpdateAssignmentStatus={canUpdateAssignmentStatus}
            />

            {isVariable ? (
                <OutletVariantList
                    variants={item.variants}
                    productType={item.product.product_type}
                    primaryMedia={item.primary_media}
                    productName={item.product.name}
                />
            ) : null}

            <ProductCustomizationView groups={item.modifier_groups} />
        </div>
    )
}
