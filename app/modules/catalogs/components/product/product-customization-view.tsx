import { ChevronDownIcon, List, UtensilsCrossedIcon } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"
import { Text } from "~/components/ui/text"

import { CatalogEmptyState } from "../catalog-empty-state"
import { StatusBadge } from "../status-badge"
import { formatCurrency } from "../../utils/format-currency"
import { SELECTION_TYPE_LABEL } from "../../utils/labels"
import type { ProductModifierGroup } from "../../types/catalog.types"

function ModifierGroupItem({ group }: { group: ProductModifierGroup }) {
    const hasDescription = group.description !== null && group.description !== ""

    return (
        <Collapsible defaultOpen className="overflow-hidden rounded-2xl border">
            <CollapsibleTrigger
                type="button"
                className="group flex w-full items-start gap-3 p-4 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50"
            >
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="flex min-w-0 items-center justify-between gap-3">
                        <Text as="span" variant="base" weight="bold" truncate>
                            {group.name}
                        </Text>
                        <StatusBadge status={group.status} />
                    </span>

                    <span className="flex flex-wrap items-center gap-1">
                        <Badge variant={group.is_required ? "default" : "secondary"}>
                            {group.is_required ? "Wajib" : "Opsional"}
                        </Badge>
                        <Badge variant="outline">{SELECTION_TYPE_LABEL[group.selection_type]}</Badge>
                        <Badge variant="outline">
                            {group.min_selection}
                            {group.max_selection === null ? "+ pilihan" : `–${group.max_selection} pilihan`}
                        </Badge>
                        <Badge variant="ghost" className="text-muted-foreground">
                            {group.modifiers.length} pilihan
                        </Badge>
                    </span>
                </span>

                <ChevronDownIcon
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-data-panel-open:rotate-180"
                />
            </CollapsibleTrigger>

            <CollapsibleContent>
                <div className="flex flex-col gap-3 border-t">
                    {hasDescription ? (
                        <Text variant="sm" className="text-muted-foreground">
                            {group.description}
                        </Text>
                    ) : null}

                    {group.modifiers.length > 0 ? (
                        <ul className="flex flex-col divide-y overflow-hidden">
                            {group.modifiers.map((modifier) => (
                                <li key={modifier.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                                    <div className="flex min-w-0 flex-col gap-1">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <Text variant="sm" weight="semibold" truncate>
                                                {modifier.name}
                                            </Text>
                                            {modifier.is_default ? <Badge variant="secondary">Default</Badge> : null}
                                        </div>
                                        <Text variant="sm" weight="medium">
                                            + {formatCurrency(modifier.price)}
                                        </Text>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                        <StatusBadge status={modifier.status} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="rounded-xl border border-dashed px-3 py-6 text-center">
                            <Text variant="sm" className="text-muted-foreground">
                                Belum ada pilihan pada group ini.
                            </Text>
                        </div>
                    )}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}

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
        <div className="mt-4 flex flex-col gap-4">
            <div className="mb-3">
                <div className="flex items-center gap-2">
                    <List aria-hidden="true" className="size-4 text-muted-foreground" />
                    <Text as="h2" variant="base" weight="bold">
                        Customization Produk
                    </Text>
                </div>
                <Text variant="xs" className="mt-1 text-muted-foreground">
                    Terdapat {groups.length} group modifier yang tersedia.
                </Text>
            </div>

            {groups.map((group) => (
                <div key={group.id}>
                    <ModifierGroupItem group={group} />
                </div>
            ))}
        </div>
    )
}
