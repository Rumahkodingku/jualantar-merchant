import { Link } from "react-router"

import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

import { StatusBadge } from "../common/status-badge"
import { ProductMediaThumbnail } from "./product-media-thumbnail"
import { formatCurrency } from "../../utils/format-currency"
import { PRODUCT_TYPE_LABEL } from "../../utils/labels"
import { buildProductMeta } from "../../utils/product-meta"
import { CATALOGS_PATHS } from "../../utils/paths"
import type { Product } from "../../types/catalog.types"

export function ProductCard({
    product,
    actionMenu,
    reorderMode = false,
    dragHandle,
    className,
}: {
    product: Product
    actionMenu?: React.ReactNode
    reorderMode?: boolean
    dragHandle?: React.ReactNode
    className?: string
}) {
    const isVariable = product.product_type === "variable"
    const hasVariantRange = isVariable && product.min_price !== null && product.min_price !== undefined
    const detailPath = CATALOGS_PATHS.detail(product.id)
    const meta = buildProductMeta(product)
    const subtitle = [product.category?.name ?? "Tanpa kategori", PRODUCT_TYPE_LABEL[product.product_type]].join(" • ")
    const priceLabel = hasVariantRange
        ? `Mulai dari ${formatCurrency(product.min_price)}`
        : isVariable
          ? "Lihat varian"
          : formatCurrency(product.price)

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
                <ProductMediaThumbnail
                    src={product.primary_media?.url ?? null}
                    alt={product.primary_media?.alt_text ?? product.name}
                />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start gap-2">
                    {reorderMode ? (
                        <Text as="p" variant="sm" weight="bold" className="line-clamp-2 leading-snug">
                            {product.name}
                        </Text>
                    ) : (
                        <Link
                            to={detailPath}
                            className="block min-w-0 flex-1 rounded-sm outline-none after:absolute after:inset-0 after:content-[''] hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                            <Text as="span" variant="sm" weight="bold" className="line-clamp-2 leading-snug">
                                {product.name}
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
                    {!reorderMode ? <StatusBadge status={product.status} /> : null}
                </div>

                {meta.length > 0 ? (
                    <Text variant="xs" className="truncate text-muted-foreground/80">
                        {meta.join(" · ")}
                    </Text>
                ) : null}
            </div>
        </div>
    )
}
