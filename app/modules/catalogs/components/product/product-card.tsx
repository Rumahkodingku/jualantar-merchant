import { Link } from "react-router"

import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

import { StatusBadge } from "../status-badge"
import { ProductMediaThumbnail } from "./product-media-thumbnail"
import { formatCurrency } from "../../utils/format-currency"
import { PRODUCT_TYPE_LABEL } from "../../utils/labels"
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
    const variantCount = isVariable ? (product.variants_count ?? 0) : 0
    const hasVariantRange = isVariable && product.min_price !== null && product.min_price !== undefined
    const detailPath = CATALOGS_PATHS.detail(product.id)
    const overlayActions = actionMenu ?? dragHandle

    console.log(product)

    return (
        <div
            className={cn(
                "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card ring-1 ring-foreground/5 transition-[border-color,box-shadow] duration-200",
                !reorderMode && "hover:border-primary/30 hover:shadow-md",
                className
            )}
        >
            <div className="relative aspect-video overflow-hidden bg-muted">
                <ProductMediaThumbnail
                    src={product.primary_media?.url ?? null}
                    alt={product.primary_media?.alt_text ?? product.name}
                />

                <div className="absolute top-2 left-2 rounded-full bg-background/85 p-1 ring-1 ring-foreground/10 backdrop-blur-sm">
                    <StatusBadge status={product.status} />
                </div>

                {overlayActions !== undefined ? (
                    <div className="absolute top-1.5 right-1.5 z-10 rounded-full bg-background/80 p-1 ring-1 ring-foreground/10 backdrop-blur-sm">
                        {overlayActions}
                    </div>
                ) : null}
            </div>

            <div className="flex flex-1 flex-col gap-1 p-3">
                {reorderMode ? (
                    <Text as="p" variant="sm" weight="semibold" className="line-clamp-2 leading-snug">
                        {product.name}
                    </Text>
                ) : (
                    <Link
                        to={detailPath}
                        className="block rounded-sm outline-none after:absolute after:inset-0 after:content-[''] hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                        <Text as="span" variant="sm" weight="semibold" className="line-clamp-2 leading-snug">
                            {product.name}
                        </Text>
                    </Link>
                )}

                <Text variant="xs" className="truncate text-muted-foreground">
                    {[
                        product.category?.name ?? "Tanpa kategori",
                        PRODUCT_TYPE_LABEL[product.product_type],
                        variantCount > 0 ? `${variantCount} varian` : null,
                    ]
                        .filter((part) => part !== null)
                        .join(" • ")}
                </Text>

                <div className="mt-auto border-t pt-2">
                    <Text
                        variant="base"
                        weight={isVariable ? "medium" : "semibold"}
                        className={cn("truncate tabular-nums", isVariable && "text-muted-foreground")}
                    >
                        {hasVariantRange
                            ? `Mulai dari ${formatCurrency(product.min_price)}`
                            : isVariable
                              ? "Lihat varian"
                              : formatCurrency(product.price)}
                    </Text>
                </div>
            </div>
        </div>
    )
}
