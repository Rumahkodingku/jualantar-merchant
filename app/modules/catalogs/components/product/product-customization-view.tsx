import { UtensilsCrossedIcon } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import { Text } from "~/components/ui/text"

import { CatalogEmptyState } from "../catalog-empty-state"
import { StatusBadge } from "../status-badge"
import { formatCurrency } from "../../utils/format-currency"
import { SELECTION_TYPE_LABEL } from "../../utils/labels"
import type { ProductModifierGroup } from "../../types/catalog.types"

export function ProductCustomizationView({ groups }: { groups: ProductModifierGroup[] }) {
    if (groups.length === 0) {
        return (
            <CatalogEmptyState
                icon={UtensilsCrossedIcon}
                title="Belum ada customization"
                description="Produk ini belum memiliki customization."
            />
        )
    }

    return (
        <ul className="flex flex-col gap-4">
            {groups.map((group) => (
                <li key={group.id} className="flex flex-col gap-3 rounded-2xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 flex-col gap-0.5">
                            <Text variant="base" weight="semibold">
                                {group.name}
                            </Text>
                            <Text variant="xs" className="text-muted-foreground">
                                {group.is_required ? "Wajib" : "Opsional"} ·{" "}
                                {SELECTION_TYPE_LABEL[group.selection_type]} · {group.min_selection}+ pilihan
                            </Text>
                        </div>
                        <StatusBadge status={group.status} />
                    </div>

                    {group.description !== null && group.description !== "" ? (
                        <Text variant="sm" className="text-muted-foreground">
                            {group.description}
                        </Text>
                    ) : null}

                    {group.modifiers.length > 0 ? (
                        <ul className="flex flex-col divide-y overflow-hidden rounded-xl border">
                            {group.modifiers.map((modifier) => (
                                <li key={modifier.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <Text variant="sm" truncate>
                                            {modifier.name}
                                        </Text>
                                        {modifier.is_default ? <Badge variant="secondary">Default</Badge> : null}
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                        <Text variant="sm" weight="medium">
                                            + {formatCurrency(modifier.price)}
                                        </Text>
                                        <StatusBadge status={modifier.status} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Text variant="sm" className="text-muted-foreground">
                            Belum ada pilihan pada group ini.
                        </Text>
                    )}
                </li>
            ))}
        </ul>
    )
}
