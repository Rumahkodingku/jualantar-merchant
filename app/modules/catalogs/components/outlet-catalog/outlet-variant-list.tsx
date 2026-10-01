import { BoxesIcon } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import { Text } from "~/components/ui/text"

import { CatalogEmptyState } from "../common/catalog-empty-state"
import { MediaThumbnail } from "../common/media-thumbnail"
import { OutletItemStatusControl } from "./outlet-item-status-control"
import { formatCurrency } from "../../utils/format-currency"
import type { OutletCatalogItem, OutletCatalogVariant, ProductPrimaryMedia } from "../../types"

/**
 * Variant list for the outlet catalog.
 *
 * The outlet resource returns a narrower variant shape than the master product,
 * so it does not reuse `ProductVariantList`; the presentation mirrors it and adds
 * the per-outlet status control, because this is the screen an outlet manager
 * manages the variants from.
 */
export function OutletVariantList({
    variants,
    productType,
    primaryMedia,
    productName,
    outletId,
    productId,
    canEditStatus,
}: {
    variants: OutletCatalogVariant[]
    productType: OutletCatalogItem["product"]["product_type"]
    primaryMedia: ProductPrimaryMedia | null
    productName: string
    outletId: string
    productId: string
    canEditStatus: boolean
}) {
    if (productType === "simple" || variants.length === 0) {
        return (
            <CatalogEmptyState
                icon={BoxesIcon}
                title="Belum ada variant"
                description={
                    productType === "simple"
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
                            <MediaThumbnail
                                src={primaryMedia?.url ?? null}
                                alt={primaryMedia?.alt_text ?? productName}
                                className="size-full"
                            />
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

                            {variant.sku !== null && variant.sku !== "" ? (
                                <Text variant="xs" className="text-muted-foreground">
                                    SKU {variant.sku}
                                </Text>
                            ) : null}
                        </div>

                        <OutletItemStatusControl
                            outletId={outletId}
                            productId={productId}
                            target={{ kind: "variant", itemId: variant.id }}
                            effectiveStatus={variant.effective_status}
                            masterStatus={variant.status}
                            isOverridden={variant.is_overridden}
                            canEdit={canEditStatus}
                            itemLabel={variant.name}
                        />
                    </li>
                ))}
            </ul>
        </div>
    )
}
