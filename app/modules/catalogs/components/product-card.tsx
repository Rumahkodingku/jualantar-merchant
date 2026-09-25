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

    return (
        <div
            className={cn(
                "relative flex h-full flex-col gap-3 rounded-2xl border bg-card p-3 ring-1 ring-foreground/5 transition-[border-color,box-shadow] duration-200",
                !reorderMode && "hover:border-primary/30 hover:shadow-sm",
                className
            )}
        >
            <div className="flex items-start gap-3">
                {dragHandle}

                <div
                    aria-hidden="true"
                    className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/5"
                >
                    {summary?.primary_media_url != null ? (
                        <img
                            src={summary.primary_media_url}
                            alt=""
                            loading="lazy"
                            className="size-full object-cover"
                            width={64}
                            height={64}
                        />
                    ) : (
                        <PackageIcon className="size-6 text-muted-foreground" />
                    )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    {reorderMode ? (
                        <Text as="p" variant="sm" weight="semibold" className="line-clamp-2">
                            {product.name}
                        </Text>
                    ) : (
                        <Link
                            to={detailPath}
                            className="block rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                            <Text as="span" variant="sm" weight="semibold" className="line-clamp-2 hover:text-primary">
                                {product.name}
                            </Text>
                        </Link>
                    )}
                    <Text variant="xs" className="truncate text-muted-foreground">
                        {[categoryName ?? "Tanpa kategori", PRODUCT_TYPE_LABEL[product.product_type]].join(" • ")}
                        {isVariable && variantCount > 0 ? ` • ${variantCount} variant` : ""}
                    </Text>
                </div>

                {actionMenu !== undefined ? (
                    <div className="relative z-10 flex shrink-0 items-center">{actionMenu}</div>
                ) : null}
            </div>

            <div className="mt-auto flex items-center justify-between gap-2 border-t pt-2">
                <Text variant="sm" weight="semibold" className="tabular-nums">
                    {priceLabel}
                </Text>
                <StatusBadge status={product.status} />
            </div>
        </div>
    )
}
