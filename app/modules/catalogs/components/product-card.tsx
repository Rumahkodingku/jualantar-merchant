import { PackageIcon } from "lucide-react"
import { Link } from "react-router"

import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

import { StatusBadge } from "./status-badge"
import { formatCurrency } from "../utils/format-currency"
import { PRODUCT_TYPE_LABEL } from "../utils/labels"
import { CATALOGS_PATHS } from "../utils/paths"
import type { ProductViewSummary } from "../services/catalog-mock.repository"
import type { Product } from "../types/catalog.types"

export function ProductCard({
    product,
    categoryName,
    summary,
    actionMenu,
    reorderMode = false,
    dragHandle,
    className,
}: {
    product: Product
    categoryName?: string
    summary?: ProductViewSummary
    actionMenu?: React.ReactNode
    reorderMode?: boolean
    dragHandle?: React.ReactNode
    className?: string
}) {
    const isVariable = product.product_type === "variable"
    const priceLabel = isVariable
        ? summary?.min_price != null
            ? `Mulai ${formatCurrency(summary.min_price)}`
            : "-"
        : formatCurrency(product.price)
    const variantCount = summary?.variant_count ?? 0
    const detailPath = CATALOGS_PATHS.detail(product.id)
    const overlayActions = actionMenu ?? dragHandle

    return (
        <div
            className={cn(
                "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card ring-1 ring-foreground/5 transition-[border-color,box-shadow] duration-200",
                !reorderMode && "hover:border-primary/30 hover:shadow-md",
                className
            )}
        >
            <div className="relative aspect-video overflow-hidden bg-muted">
                {summary?.primary_media_url != null ? (
                    <img
                        src={summary.primary_media_url}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover"
                        width={480}
                        height={270}
                    />
                ) : (
                    <span className="flex size-full items-center justify-center">
                        <PackageIcon aria-hidden="true" className="size-8 text-muted-foreground/70" />
                    </span>
                )}

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
                    {[categoryName ?? "Tanpa kategori", PRODUCT_TYPE_LABEL[product.product_type]].join(" • ")}
                </Text>

                <div className="mt-auto flex items-center justify-between gap-2 border-t pt-2">
                    <Text variant="base" weight="semibold" className="tabular-nums">
                        {priceLabel}
                    </Text>
                    {variantCount > 0 ? (
                        <Text variant="xs" className="shrink-0 text-muted-foreground">
                            {variantCount} varian
                        </Text>
                    ) : null}
                </div>
            </div>
        </div>
    )
}
