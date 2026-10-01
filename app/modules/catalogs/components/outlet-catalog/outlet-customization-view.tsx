import { ProductCustomizationView } from "../product-detail/product-customization-view"
import { OutletItemStatusControl } from "./outlet-item-status-control"
import type { OutletModifierGroup } from "../../types"

/**
 * The customization section of the outlet product detail.
 *
 * It reuses the shared read-only layout and only swaps the status badge for the
 * per-outlet control, so the master and outlet screens cannot drift apart. The
 * capability is resolved by the page and passed in as a boolean, matching how the
 * availability and assignment controls are wired.
 */
export function OutletCustomizationView({
    groups,
    outletId,
    productId,
    canEditStatus,
}: {
    groups: OutletModifierGroup[]
    outletId: string
    productId: string
    canEditStatus: boolean
}) {
    return (
        <ProductCustomizationView
            groups={groups}
            renderGroupStatus={(group) => (
                <OutletItemStatusControl
                    outletId={outletId}
                    productId={productId}
                    target={{ kind: "modifier_group", itemId: group.id }}
                    effectiveStatus={group.effective_status}
                    masterStatus={group.status}
                    isOverridden={group.is_overridden}
                    canEdit={canEditStatus}
                    itemLabel={group.name}
                />
            )}
            renderModifierStatus={(modifier, group) => (
                <OutletItemStatusControl
                    outletId={outletId}
                    productId={productId}
                    target={{ kind: "modifier", groupId: group.id, itemId: modifier.id }}
                    effectiveStatus={modifier.effective_status}
                    masterStatus={modifier.status}
                    isOverridden={modifier.is_overridden}
                    canEdit={canEditStatus}
                    itemLabel={modifier.name}
                />
            )}
        />
    )
}
