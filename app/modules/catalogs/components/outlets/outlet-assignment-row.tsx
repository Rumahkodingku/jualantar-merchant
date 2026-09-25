import { Trash2Icon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"

import { AvailabilityBadge } from "./availability-badge"
import { AvailabilityControl } from "./availability-control"
import { StatusBadge } from "../status-badge"
import { useSetOutletAssignmentStatus } from "../../services/product-outlets/product-outlet.mutations"
import { catalogErrorMessage } from "../../utils/api-error"
import { notifyError, notifySuccess } from "~/lib/notify"
import type { OutletProductAssignment } from "../../types/catalog.types"

export function OutletAssignmentRow({
    productId,
    assignment,
    onRemove,
}: {
    productId: string
    assignment: OutletProductAssignment
    onRemove: () => void
}) {
    const statusMutation = useSetOutletAssignmentStatus(productId, assignment.outlet_id)

    return (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 ring-1 ring-foreground/5">
            <div className="flex items-center justify-between gap-2">
                <Text variant="sm" weight="medium" truncate>
                    {assignment.outlet?.name ?? assignment.outlet_id}
                </Text>
                <div className="flex shrink-0 items-center gap-1.5">
                    <StatusBadge status={assignment.status} />
                    <AvailabilityBadge status={assignment.availability_status} />
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t pt-2.5">
                <div className="flex flex-col">
                    <Text variant="xs" weight="medium">
                        Assignment
                    </Text>
                    <Text variant="xs" className="text-muted-foreground">
                        Produk ditugaskan ke outlet
                    </Text>
                </div>
                <Switch
                    checked={assignment.status === "active"}
                    disabled={statusMutation.isPending}
                    aria-label={`Assignment ${assignment.outlet?.name ?? assignment.outlet_id}`}
                    onCheckedChange={(checked) =>
                        statusMutation.mutate(checked === true ? "active" : "inactive", {
                            onSuccess: () => notifySuccess("Status assignment diperbarui"),
                            onError: (error) =>
                                notifyError(catalogErrorMessage(error, "Gagal memperbarui status assignment")),
                        })
                    }
                />
            </div>

            <div className="flex items-center justify-between gap-3 border-t pt-2.5">
                <div className="flex flex-col">
                    <Text variant="xs" weight="medium">
                        Availability
                    </Text>
                    <Text variant="xs" className="text-muted-foreground">
                        {assignment.availability_status === "unavailable" && assignment.unavailable_reason != null
                            ? `Alasan: ${assignment.unavailable_reason}`
                            : "Produk sedang tersedia/tidak tersedia"}
                    </Text>
                </div>
                <div className="flex items-center gap-2">
                    <AvailabilityControl productId={productId} assignment={assignment} />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Hapus penugasan ${assignment.outlet?.name ?? ""}`}
                        className="text-destructive"
                        onClick={onRemove}
                    >
                        <Trash2Icon />
                    </Button>
                </div>
            </div>
        </div>
    )
}
