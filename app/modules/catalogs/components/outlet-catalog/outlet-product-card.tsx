import { Link } from "react-router"

import { Badge } from "~/components/ui/badge"
import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

import { AvailabilityBadge } from "../outlets/availability-badge"
import { MediaThumbnail } from "../common/media-thumbnail"
import { StatusBadge } from "../common/status-badge"
import { formatCurrency } from "../../utils/format-currency"
import { PRODUCT_TYPE_LABEL } from "../../utils/labels"
import { CATALOGS_PATHS } from "../../utils/paths"
import type { OutletCatalogItem } from "../../types"

/**
 * One row of the effective outlet catalog. Presentation only: it never triggers
 * a master mutation, and it links to the outlet-scoped detail route.
 */
export function OutletProductCard({
    item,
    outletId,
    actionMenu,
    reorderMode = false,
    dragHandle,
    className,
}: {
    item: OutletCatalogItem
    outletId: string
    actionMenu?: React.ReactNode
    reorderMode?: boolean
    dragHandle?: React.ReactNode
    className?: string
}) {
    const isVariable = item.product.product_type === "variable"
    const activeVariantPrices = item.variants
        .filter((variant) => variant.status === "active")
        .map((variant) => variant.price)
    const priceLabel = isVariable
        ? activeVariantPrices.length > 0
            ? `Mulai dari ${formatCurrency(Math.min(...activeVariantPrices))}`
            : "Lihat varian"
        : formatCurrency(item.product.price)
    const subtitle = [item.category?.name ?? "Tanpa kategori", PRODUCT_TYPE_LABEL[item.product.product_type]].join(
        " • "
    )

    return (
        <div
            className={cn(
                "relative flex items-center gap-3 rounded-xl bg-card shadow-none duration-200",
                !reorderMode && "hover:border-primary/30",
                className
            )}
        >
            {reorderMode && dragHandle !== undefined ? (
                <div className="relative z-10 flex shrink-0 items-center">{dragHandle}</div>
            ) : null}

            <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-20">
                <MediaThumbnail
                    src={item.primary_media?.url ?? null}
                    alt={item.primary_media?.alt_text ?? item.product.name}
                />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start gap-2">
                    {reorderMode ? (
                        <Text as="p" variant="sm" weight="bold" className="line-clamp-2 leading-snug">
                            {item.product.name}
                        </Text>
                    ) : (
                        <Link
                            to={CATALOGS_PATHS.outletProduct(outletId, item.product.id)}
                            className="block min-w-0 flex-1 rounded-sm outline-none after:absolute after:inset-0 after:content-[''] hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                            <Text as="span" variant="sm" weight="bold" className="line-clamp-2 leading-snug">
                                {item.product.name}
                            </Text>
                        </Link>
                    )}

                    {!reorderMode && actionMenu !== undefined ? (
                        <div className="relative z-10 -mt-1 -mr-1 shrink-0">{actionMenu}</div>
                    ) : null}
                </div>

                <Text variant="xs" className="truncate text-muted-foreground">
                    {subtitle}
                </Text>

                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <Text
                        variant="sm"
                        weight={isVariable ? "medium" : "semibold"}
                        className={cn("truncate tabular-nums", isVariable && "text-muted-foreground")}
                    >
                        {priceLabel}
                    </Text>
                    <StatusBadge status={item.product.status} />
                </div>

                {!reorderMode ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                        {item.assignment !== null ? (
                            <AvailabilityBadge status={item.assignment.availability_status} />
                        ) : null}
                        {!item.is_sellable ? (
                            <Badge variant="outline" className="border-transparent bg-muted text-muted-foreground">
                                Tidak dapat dijual
                            </Badge>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    )
}
