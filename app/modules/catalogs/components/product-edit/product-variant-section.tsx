import { Text } from "~/components/ui/text"

import { EditableSection } from "./editable-section"
import { VariantEditor } from "../variants/variant-editor"
import { formatCurrency } from "../../utils/format-currency"
import { PRODUCT_TYPE_LABEL } from "../../utils/labels"
import type { ProductDetail } from "../../types"

/**
 * A variable product's price list. It is folded into the price slot because a
 * product is either simple or variable and the merchant already chose which.
 */
export function ProductVariantSection({
    product,
    isExpanded,
    isEditing,
    onToggle,
    onStartEdit,
    onStopEdit,
}: {
    product: ProductDetail
    isExpanded: boolean
    isEditing: boolean
    onToggle: () => void
    onStartEdit: () => void
    onStopEdit: () => void
}) {
    const variants = product.variants ?? []

    return (
        <EditableSection
            title="Variant"
            summary={`${variants.length} variant`}
            isExpanded={isExpanded}
            isEditing={isEditing}
            onToggle={onToggle}
            onStartEdit={onStartEdit}
            onStopEdit={onStopEdit}
            view={
                variants.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-5">
                        <Text variant="sm" className="text-muted-foreground">
                            Belum ada variant.
                        </Text>
                    </div>
                ) : (
                    <ul className="flex flex-col gap-1.5">
                        {variants.map((variant) => (
                            <li
                                key={variant.id}
                                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                            >
                                <span className="flex min-w-0 flex-col">
                                    <Text variant="sm" truncate>
                                        {variant.name}
                                        {variant.is_default ? " (default)" : ""}
                                    </Text>
                                    <Text variant="xs" className="text-muted-foreground">
                                        {/* Kept as "Simple" to match what shipped, though
                                            this list only ever shows for a variable
                                            product, so the label reads wrong. Worth a
                                            product decision, not a refactor one. */}
                                        {PRODUCT_TYPE_LABEL.simple} •{" "}
                                        {variant.status === "active" ? "Aktif" : "Nonaktif"}
                                    </Text>
                                </span>
                                <Text variant="sm" className="shrink-0">
                                    {formatCurrency(variant.price)}
                                </Text>
                            </li>
                        ))}
                    </ul>
                )
            }
            editor={<VariantEditor productId={product.id} variants={variants} />}
        />
    )
}
