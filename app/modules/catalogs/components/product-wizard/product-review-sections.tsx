import { ImageIcon } from "lucide-react"

import { Text } from "~/components/ui/text"

import { ReviewSection } from "../review-section"
import { formatCurrency } from "../../utils/format-currency"
import { PRODUCT_TYPE_LABEL } from "../../utils/labels"
import type { ProductInfoFormValues } from "../../schemas/catalog.schema"
import type { CatalogOutlet } from "../../types/catalog.types"
import type { GroupDraft, MediaDraft, VariantDraft } from "./types"

export function ProductReviewSections({
    info,
    priceRaw,
    variants,
    groups,
    media,
    outlets,
    outletIds,
    categories,
    expandedId,
    onToggle,
}: {
    info: ProductInfoFormValues
    priceRaw: string
    variants: VariantDraft[]
    groups: GroupDraft[]
    media: MediaDraft[]
    outlets: CatalogOutlet[]
    outletIds: string[]
    categories: Array<{ id: string; name: string }>
    expandedId: string | null
    onToggle: (id: string) => void
}) {
    const categoryName = categories.find((category) => category.id === info.category_id)?.name ?? null

    const sections = [
        {
            id: "info",
            title: "Informasi",
            summary: [info.name, categoryName ?? "Tanpa kategori"].filter((part) => part !== "").join(" • "),
            content: (
                <dl className="flex flex-col divide-y rounded-xl border">
                    {[
                        { term: "Nama", value: info.name || "-" },
                        { term: "Kategori", value: categoryName ?? "-" },
                        { term: "Deskripsi", value: info.description ?? "-" },
                        { term: "Tipe produk", value: PRODUCT_TYPE_LABEL[info.product_type] },
                        {
                            term: "Harga",
                            value:
                                info.product_type === "simple"
                                    ? formatCurrency(Number(priceRaw))
                                    : variants.length > 0
                                      ? `Mulai ${formatCurrency(Math.min(...variants.map((variant) => variant.price)))}`
                                      : "-",
                        },
                    ].map((row) => (
                        <div key={row.term} className="flex items-start justify-between gap-4 px-3 py-2">
                            <dt className="shrink-0 text-sm text-muted-foreground">{row.term}</dt>
                            <dd className="text-right text-sm font-medium wrap-break-word">{row.value}</dd>
                        </div>
                    ))}
                </dl>
            ),
        },
        {
            id: "variant",
            title: info.product_type === "simple" ? "Harga" : "Variant",
            summary: info.product_type === "simple" ? formatCurrency(Number(priceRaw)) : `${variants.length} variant`,
            content:
                info.product_type === "simple" ? (
                    <Text variant="sm">{formatCurrency(Number(priceRaw))}</Text>
                ) : (
                    <ul className="flex flex-col gap-1.5">
                        {variants.map((variant) => (
                            <li
                                key={variant.key}
                                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                            >
                                <Text variant="sm" truncate>
                                    {variant.name}
                                    {variant.is_default ? " (default)" : ""}
                                </Text>
                                <Text variant="sm" className="shrink-0">
                                    {formatCurrency(variant.price)}
                                </Text>
                            </li>
                        ))}
                    </ul>
                ),
        },
        {
            id: "customization",
            title: "Customization",
            summary: groups.length > 0 ? `${groups.length} modifier group` : "Tidak ada customization",
            content: (
                <div className="flex flex-col gap-3">
                    {groups.length === 0 ? (
                        <Text variant="sm" className="text-muted-foreground">
                            Tidak ada modifier group.
                        </Text>
                    ) : (
                        groups.map((group) => (
                            <div key={group.key} className="rounded-xl border p-3">
                                <Text variant="sm" weight="semibold">
                                    {group.name}
                                </Text>
                                <Text variant="xs" className="text-muted-foreground">
                                    {group.modifiers.length} modifier • {group.is_required ? "Wajib" : "Opsional"}
                                </Text>
                            </div>
                        ))
                    )}
                </div>
            ),
        },
        {
            id: "media",
            title: "Media",
            summary: `${media.length} foto`,
            content: (
                <div className="flex flex-wrap gap-2">
                    {media.length === 0 ? (
                        <Text variant="sm" className="text-muted-foreground">
                            Belum ada foto.
                        </Text>
                    ) : (
                        media.map((item) => (
                            <div key={item.key} className="relative size-16 overflow-hidden rounded-lg border bg-muted">
                                {item.preview_url === null ? (
                                    <div className="flex size-full items-center justify-center text-muted-foreground">
                                        <ImageIcon aria-hidden="true" className="size-4" />
                                    </div>
                                ) : (
                                    <img
                                        src={item.preview_url}
                                        alt={item.alt_text}
                                        className="size-full object-cover"
                                    />
                                )}
                            </div>
                        ))
                    )}
                </div>
            ),
        },
        {
            id: "outlet",
            title: "Outlet",
            summary: `${outletIds.length} outlet`,
            content: (
                <ul className="flex flex-col gap-1.5">
                    {outletIds.length === 0 ? (
                        <Text variant="sm" className="text-muted-foreground">
                            Belum ada outlet dipilih.
                        </Text>
                    ) : (
                        outlets
                            .filter((outlet) => outletIds.includes(outlet.id))
                            .map((outlet) => (
                                <li key={outlet.id} className="rounded-lg border px-3 py-2">
                                    <Text variant="sm">{outlet.name}</Text>
                                </li>
                            ))
                    )}
                </ul>
            ),
        },
    ]

    return (
        <div className="flex flex-col gap-3">
            {sections.map((section) => (
                <ReviewSection
                    key={section.id}
                    title={section.title}
                    summary={section.summary}
                    expanded={expandedId === section.id}
                    onToggle={() => onToggle(section.id)}
                >
                    {section.content}
                </ReviewSection>
            ))}
        </div>
    )
}
