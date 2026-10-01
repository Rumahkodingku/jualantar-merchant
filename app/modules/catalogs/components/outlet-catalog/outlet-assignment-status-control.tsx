import { Switch } from "~/components/ui/switch"

import { StatusBadge } from "../common/status-badge"
import { useSetOutletAssignmentStatus } from "../../services/product-outlets/product-outlet.mutations"
import { catalogErrorMessage } from "../../utils/api-error"
import { notifyError, notifySuccess } from "~/lib/notify"
import type { CatalogStatus } from "../../types"

/**
 * Assignment status of one product at one outlet. Staff get a read-only badge;
 * only roles holding `catalog.assignment.status.update` (owner/manager) see the
 * switch. The API remains the enforcement boundary.
 */
export function OutletAssignmentStatusControl({
    productId,
    outletId,
    status,
    canEdit,
    outletLabel,
}: {
    productId: string
    outletId: string
    status: CatalogStatus
    canEdit: boolean
    outletLabel: string
}) {
    const mutation = useSetOutletAssignmentStatus(productId, outletId)

    if (!canEdit) {
        return <StatusBadge status={status} />
    }

    return (
        <div className="flex items-center gap-2">
            <StatusBadge status={status} />
            <Switch
                checked={status === "active"}
                disabled={mutation.isPending}
                aria-label={`Status penugasan ${outletLabel}`}
                onCheckedChange={(checked) =>
                    mutation.mutate(checked === true ? "active" : "inactive", {
                        onSuccess: () => notifySuccess("Status penugasan diperbarui"),
                        onError: (error) =>
                            notifyError(catalogErrorMessage(error, "Gagal memperbarui status penugasan")),
                    })
                }
            />
        </div>
    )
}
