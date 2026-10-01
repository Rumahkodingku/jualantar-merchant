import { Text } from "~/components/ui/text"
import { Switch } from "~/components/ui/switch"

import { StatusBadge } from "../common/status-badge"
import { useSetOutletItemStatus } from "../../services/outlet-catalog/outlet-catalog.mutations"
import type { OutletItemTarget } from "../../services/outlet-catalog/outlet-catalog.api"
import { catalogErrorMessage } from "../../utils/api-error"
import { notifyError, notifySuccess } from "~/lib/notify"
import type { CatalogStatus } from "../../types"

/**
 * Active status of one variant or customization item at one outlet.
 *
 * The master status is the ceiling, so the switch only ever appears for an item
 * that is active in the master catalog: turning it off hides the item here,
 * turning it back on drops the override so the item follows the master again.
 * That is why an item the owner deactivated shows a plain badge with a note
 * instead of a switch that could not do anything.
 *
 * Roles without the matching capability get the badge only. The API stays the
 * enforcement boundary, and it can still refuse with a conflict — for instance
 * when hiding the item would leave the product with nothing sellable here.
 */
export function OutletItemStatusControl({
    outletId,
    productId,
    target,
    effectiveStatus,
    masterStatus,
    isOverridden,
    canEdit,
    itemLabel,
}: {
    outletId: string
    productId: string
    target: OutletItemTarget
    effectiveStatus: CatalogStatus
    masterStatus: CatalogStatus
    isOverridden: boolean
    canEdit: boolean
    itemLabel: string
}) {
    const mutation = useSetOutletItemStatus(outletId, productId)

    const status = (
        <div className="flex flex-col items-end gap-0.5">
            <StatusBadge status={effectiveStatus} />
            {masterStatus === "inactive" ? (
                <Text variant="xs" className="text-muted-foreground">
                    Nonaktif di katalog pusat
                </Text>
            ) : isOverridden ? (
                <Text variant="xs" className="text-muted-foreground">
                    Berbeda dari katalog pusat
                </Text>
            ) : null}
        </div>
    )

    if (!canEdit || masterStatus === "inactive") {
        return status
    }

    return (
        <div className="flex shrink-0 flex-col items-end gap-0.5">
            <div className="flex items-center gap-2">
                <StatusBadge status={effectiveStatus} />
                <Switch
                    checked={effectiveStatus === "active"}
                    disabled={mutation.isPending}
                    aria-label={`Status ${itemLabel} di outlet ini`}
                    onCheckedChange={(checked) =>
                        mutation.mutate(
                            { target, active: checked === true },
                            {
                                onSuccess: () =>
                                    notifySuccess(
                                        checked === true
                                            ? `${itemLabel} kembali mengikuti katalog pusat`
                                            : `${itemLabel} dinonaktifkan di outlet ini`
                                    ),
                                onError: (error) =>
                                    notifyError(catalogErrorMessage(error, "Gagal memperbarui status item")),
                            }
                        )
                    }
                />
            </div>
            {isOverridden ? (
                <Text variant="xs" className="text-muted-foreground">
                    Berbeda dari katalog pusat
                </Text>
            ) : null}
        </div>
    )
}
