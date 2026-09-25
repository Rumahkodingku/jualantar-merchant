import { Text } from "~/components/ui/text"

import { StatusBadge } from "../status-badge"
import { formatCurrency } from "../../utils/format-currency"
import { SELECTION_TYPE_LABEL } from "../../utils/labels"
import type { ProductModifierGroup } from "../../types/catalog.types"

export function ModifierGroupSummaryCard({ group }: { group: ProductModifierGroup }) {
    return (
        <div className="flex flex-col gap-2 rounded-2xl border bg-card p-4 ring-1 ring-foreground/5">
            <div className="flex items-center justify-between gap-2">
                <Text variant="sm" weight="semibold" truncate>
                    {group.name}
                </Text>
                <StatusBadge status={group.status} />
            </div>
            <Text variant="xs" className="text-muted-foreground">
                {(group.is_required ? "Wajib" : "Opsional") +
                    " • " +
                    SELECTION_TYPE_LABEL[group.selection_type] +
                    " • " +
                    (group.max_selection != null
                        ? `${group.max_selection} pilihan`
                        : `${group.min_selection}+ pilihan`)}
            </Text>
            <ul className="flex flex-col gap-1.5 border-t pt-2">
                {group.modifiers.length === 0 ? (
                    <li>
                        <Text variant="xs" className="text-muted-foreground">
                            Belum ada modifier.
                        </Text>
                    </li>
                ) : (
                    group.modifiers.map((modifier) => (
                        <li key={modifier.id} className="flex items-center justify-between gap-3">
                            <Text variant="sm" truncate>
                                {modifier.name}
                            </Text>
                            <Text variant="sm" className="shrink-0">
                                {formatCurrency(modifier.price)}
                            </Text>
                        </li>
                    ))
                )}
            </ul>
        </div>
    )
}
