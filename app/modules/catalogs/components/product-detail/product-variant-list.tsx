import { BoxesIcon } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { Text } from "~/components/ui/text"
import { CatalogEmptyState } from "../common/catalog-empty-state"
import { StatusBadge } from "../common/status-badge"
import { MediaThumbnail } from "../common/media-thumbnail"
import { formatCurrency } from "../../utils/format-currency"
import { sortByDisplayOrder } from "../../utils/media-order"
import type { ProductDetail } from "../../types"

export function ProductVariantList({ product }: { product: ProductDetail }) {
    const variants = sortByDisplayOrder(product.variants ?? [])
    const media = sortByDisplayOrder(product.media ?? [])
    const primaryMedia = media.find((item) => item.is_primary) ?? media[0] ?? null
    const imageSrc = product.primary_media?.url ?? primaryMedia?.url ?? null
    const imageAlt = product.primary_media?.alt_text ?? primaryMedia?.alt_text ?? product.name

    if (product.product_type === "simple" || variants.length === 0) {
        return (
            <CatalogEmptyState
                icon={BoxesIcon}
                title="Belum ada variant"
                description={
                    product.product_type === "simple"
                        ? "Produk ini menggunakan satu harga dan tidak memiliki variant."
                        : "Produk ini belum memiliki variant."
                }
            />
        )
    }

    return (
        <div className="mt-4 flex flex-col gap-3">
            <div className="mb-3">
                <div className="flex items-center gap-2">
                    <BoxesIcon aria-hidden="true" className="size-4 text-muted-foreground" />
                    <Text as="h2" variant="base" weight="bold">
                        Variant Produk
                    </Text>
                </div>
                <Text variant="xs" className="mt-1 text-muted-foreground">
                    Terdapat {variants.length} variant produk dengan harga yang berbeda.
                </Text>
            </div>

            <ul className="flex flex-col gap-4">
                {variants.map((variant) => (
                    <li key={variant.id} className="flex items-center gap-3">
                        <div className="size-16 shrink-0 overflow-hidden rounded-xl border bg-muted">
                            <MediaThumbnail src={imageSrc} alt={imageAlt} className="size-full" />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                            <div className="flex min-w-0 items-center gap-2">
                                <Text variant="sm" weight="bold" truncate>
                                    {variant.name}
                                </Text>
                                {variant.is_default ? <Badge className="text-xs">Default</Badge> : null}
                            </div>

                            <Text variant="sm" weight="medium">
                                {formatCurrency(variant.price)}
                            </Text>

                            <div className="flex flex-wrap items-center gap-2">
                                {variant.sku !== null && variant.sku !== "" ? (
                                    <Text variant="xs" className="text-muted-foreground">
                                        SKU {variant.sku}
                                    </Text>
                                ) : null}
                            </div>
                        </div>

                        <StatusBadge status={variant.status} />
                    </li>
                ))}
            </ul>
        </div>
    )
}
