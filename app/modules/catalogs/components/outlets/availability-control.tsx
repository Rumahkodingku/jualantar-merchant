import { useState } from "react"

import { Button } from "~/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog"
import { Field, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Spinner } from "~/components/ui/spinner"
import { Switch } from "~/components/ui/switch"

import { useSetOutletAvailability } from "../../services/product-outlets/product-outlet.mutations"
import { catalogErrorMessage } from "../../utils/api-error"
import { notifyError, notifySuccess } from "~/lib/notify"
import type { OutletProductAssignment } from "../../types/catalog.types"

export function AvailabilityControl({
    productId,
    assignment,
}: {
    productId: string
    assignment: OutletProductAssignment
}) {
    const availabilityMutation = useSetOutletAvailability(productId, assignment.outlet_id)
    const [reasonOpen, setReasonOpen] = useState(false)
    const [reason, setReason] = useState("")

    const outletLabel = assignment.outlet?.name ?? assignment.outlet_id

    function handleSuccess() {
        setReasonOpen(false)
        notifySuccess("Ketersediaan diperbarui")
    }

    function handleError(error: unknown) {
        notifyError(catalogErrorMessage(error, "Gagal memperbarui ketersediaan"))
    }

    function handleToggle(checked: boolean) {
        if (checked === true) {
            availabilityMutation.mutate({ status: "available" }, { onSuccess: handleSuccess, onError: handleError })
            return
        }

        setReason("")
        setReasonOpen(true)
    }

    function submitUnavailable(withReason: boolean) {
        const trimmed = reason.trim()

        availabilityMutation.mutate(
            { status: "unavailable", reason: withReason && trimmed !== "" ? trimmed : null },
            { onSuccess: handleSuccess, onError: handleError }
        )
    }

    return (
        <>
            <Switch
                checked={assignment.availability_status === "available"}
                disabled={availabilityMutation.isPending || assignment.status === "inactive"}
                aria-label={`Ketersediaan ${outletLabel}`}
                onCheckedChange={handleToggle}
            />

            <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tandai tidak tersedia</DialogTitle>
                        <DialogDescription>
                            Alasan bersifat opsional dan membantu tim outlet memahami kenapa produk tidak tersedia.
                        </DialogDescription>
                    </DialogHeader>
                    <Field>
                        <FieldLabel htmlFor={`availability-reason-${assignment.outlet_id}`}>
                            Alasan (opsional)
                        </FieldLabel>
                        <Input
                            id={`availability-reason-${assignment.outlet_id}`}
                            value={reason}
                            maxLength={255}
                            placeholder="cth. Stok habis"
                            onChange={(event) => setReason(event.target.value)}
                            className="h-11"
                        />
                    </Field>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={availabilityMutation.isPending}
                            onClick={() => submitUnavailable(false)}
                        >
                            Lewati
                        </Button>
                        <Button
                            type="button"
                            disabled={availabilityMutation.isPending}
                            onClick={() => submitUnavailable(true)}
                        >
                            {availabilityMutation.isPending ? (
                                <>
                                    <Spinner /> Menyimpan…
                                </>
                            ) : (
                                "Simpan"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
