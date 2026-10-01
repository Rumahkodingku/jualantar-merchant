import { ChevronDownIcon, List, UtensilsCrossedIcon } from "lucide-react"
import type { ReactNode } from "react"
import { Badge } from "~/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"
import { Text } from "~/components/ui/text"
import { CatalogEmptyState } from "../common/catalog-empty-state"
import { StatusBadge } from "../common/status-badge"
import { OutletOverrideList } from "./outlet-override-list"
import { formatCurrency } from "../../utils/format-currency"
import { SELECTION_TYPE_LABEL } from "../../utils/labels"
import type { CatalogStatus, OutletItemOverride, SelectionType } from "../../types"

/**
 * The minimum a customization option has to expose to be rendered here.
 *
 * Both the master group (`ProductModifierGroup`) and the outlet-scoped group
 * (`OutletModifierGroup`) satisfy these structurally, which is what lets one
 * component serve both screens without duplicating the layout. The outlet type
 * only adds fields; it never removes any.
 */
export interface CustomizationOptionView {
    id: string
    name: string
    description: string | null
    price: number
    is_default: boolean
    status: CatalogStatus
    /** Present only on the master product detail. */
    outlet_overrides?: OutletItemOverride[]
}

export interface CustomizationGroupView {
    id: string
    name: string
    description: string | null
    selection_type: SelectionType
    min_selection: number
    max_selection: number | null
    is_required: boolean
    status: CatalogStatus
    /** Present only on the master product detail. */
    outlet_overrides?: OutletItemOverride[]
    modifiers: CustomizationOptionView[]
}

/**
 * Replaces the plain status badge of a group or an option.
 *
 * The outlet screen passes a control here so an outlet manager can hide the item
 * at their outlet; the master screen keeps the default badge.
 */
export interface CustomizationStatusRenderers<TGroup extends CustomizationGroupView> {
    renderGroupStatus?: (group: TGroup) => ReactNode
    renderModifierStatus?: (modifier: TGroup["modifiers"][number], group: TGroup) => ReactNode
}

function ModifierGroupItem<TGroup extends CustomizationGroupView>({
    group,
    productId,
    renderGroupStatus,
    renderModifierStatus,
}: {
    group: TGroup
    productId: string | undefined
} & CustomizationStatusRenderers<TGroup>) {
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
                        {renderGroupStatus === undefined ? (
                            <StatusBadge status={group.status} />
                        ) : (
                            renderGroupStatus(group)
                        )}
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

                    {productId === undefined ? null : (
                        <OutletOverrideList
                            productId={productId}
                            itemName={group.name}
                            itemLabel="Customization group"
                            overrides={group.outlet_overrides}
                            target={{ kind: "modifier_group", itemId: group.id }}
                        />
                    )}
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

                                        {productId === undefined ? null : (
                                            <OutletOverrideList
                                                productId={productId}
                                                itemName={modifier.name}
                                                itemLabel="Pilihan customization"
                                                overrides={modifier.outlet_overrides}
                                                target={{
                                                    kind: "modifier",
                                                    groupId: group.id,
                                                    itemId: modifier.id,
                                                }}
                                            />
                                        )}
                                    </div>

                                    <div className="flex shrink-0 items-center gap-2">
                                        {renderModifierStatus === undefined ? (
                                            <StatusBadge status={modifier.status} />
                                        ) : (
                                            renderModifierStatus(modifier, group)
                                        )}
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

/**
 * Read-only customization view, shared by the master catalog and the outlet
 * catalog.
 *
 * The generic parameter is what lets the outlet screen pass its own status
 * renderer while keeping a single layout: `OutletModifierGroup` structurally
 * satisfies `CustomizationGroupView`, so nothing here needs to know about
 * outlets at all.
 */
export function ProductCustomizationView<TGroup extends CustomizationGroupView>({
    groups,
    productId,
    ...renderers
}: {
    groups: TGroup[]
    /**
     * Needed only to render the owner's outlet override list. The outlet screen
     * has no overrides to show, so it may leave it out.
     */
    productId?: string
} & CustomizationStatusRenderers<TGroup>) {
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
                    <ModifierGroupItem group={group} productId={productId} {...renderers} />
                </div>
            ))}
        </div>
    )
}
