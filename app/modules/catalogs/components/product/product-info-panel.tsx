import { Text } from "~/components/ui/text"

import { StatusBadge } from "../status-badge"
import { formatCurrency } from "../../utils/format-currency"
import { PRODUCT_TYPE_LABEL } from "../../utils/labels"
import type { ProductDetail } from "../../types/catalog.types"

export function ProductInfoPanel({ product }: { product: ProductDetail }) {
    const primaryMedia = product.media?.find((item) => item.is_primary) ?? product.media?.[0]

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4">
                <div className="size-24 shrink-0 overflow-hidden rounded-2xl bg-muted">
                    {primaryMedia?.url != null ? (
                        <img
                            src={primaryMedia.url}
                            alt={primaryMedia.alt_text ?? ""}
                            className="size-full object-cover"
                        />
                    ) : (
                        <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                            Foto
                        </div>
                    )}
                </div>
                <div className="flex min-w-0 flex-col justify-center gap-1">
                    <Text as="p" variant="base" weight="semibold">
                        {product.name}
                    </Text>
                    <StatusBadge status={product.status} className="self-start" />
                </div>
            </div>

            <dl className="flex flex-col divide-y rounded-2xl border">
                {[
                    { term: "Kategori", value: product.category?.name ?? "Tanpa kategori" },
                    { term: "Deskripsi", value: product.description ?? "-" },
                    { term: "Tipe produk", value: PRODUCT_TYPE_LABEL[product.product_type] },
                    {
                        term: "Harga",
                        value:
                            product.product_type === "simple"
                                ? formatCurrency(product.price)
                                : product.variants != null && product.variants.length > 0
                                  ? `Mulai ${formatCurrency(Math.min(...product.variants.map((variant) => variant.price)))}`
                                  : "-",
                    },
                ].map((row) => (
                    <div key={row.term} className="flex items-start justify-between gap-4 px-4 py-3">
                        <dt className="shrink-0 text-sm text-muted-foreground">{row.term}</dt>
                        <dd className="text-right text-sm font-medium wrap-break-word">{row.value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    )
}
