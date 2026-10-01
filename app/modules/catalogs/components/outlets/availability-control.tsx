import { useState } from "react"
import { XIcon } from "lucide-react"

import {
    BottomSheet,
    BottomSheetBody,
    BottomSheetClose,
    BottomSheetContent,
    BottomSheetDescription,
    BottomSheetFooter,
    BottomSheetHeader,
    BottomSheetTitle,
} from "~/components/ui/bottom-sheet"
import { Button } from "~/components/ui/button"
import { Field, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Spinner } from "~/components/ui/spinner"
import { Switch } from "~/components/ui/switch"

import { useSetOutletAvailability } from "../../services/product-outlets/product-outlet.mutations"
import { catalogErrorMessage } from "../../utils/api-error"
import { notifyError, notifySuccess } from "~/lib/notify"
import type { AvailabilityStatus } from "../../types"

/**
 * Availability switch for one product at one outlet. Takes the outlet explicitly
 * (rather than a full assignment) so it can be reused by both the master outlet
 * tab and the outlet catalog detail, whose assignment shapes differ.
 */
export function AvailabilityControl({
    productId,
    outletId,
    availabilityStatus,
    disabled = false,
    outletLabel,
}: {
    productId: string
    outletId: string
    availabilityStatus: AvailabilityStatus
    disabled?: boolean
    outletLabel?: string
}) {
    const availabilityMutation = useSetOutletAvailability(productId, outletId)
    const [reasonOpen, setReasonOpen] = useState(false)
    const [reason, setReason] = useState("")

    const label = outletLabel ?? outletId

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
                checked={availabilityStatus === "available"}
                disabled={availabilityMutation.isPending || disabled}
                aria-label={`Ketersediaan ${label}`}
                onCheckedChange={handleToggle}
            />

            <BottomSheet open={reasonOpen} onOpenChange={setReasonOpen}>
                <BottomSheetContent>
                    <BottomSheetHeader>
                        <BottomSheetTitle>Tandai tidak tersedia</BottomSheetTitle>
                        <BottomSheetDescription>
                            Alasan bersifat opsional dan membantu tim outlet memahami kenapa produk tidak tersedia.
                        </BottomSheetDescription>
                        <BottomSheetClose
                            render={
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-sm"
                                    className="absolute top-3 right-3 hidden md:inline-flex"
                                    aria-label="Tutup alasan"
                                />
                            }
                        >
                            <XIcon aria-hidden="true" />
                        </BottomSheetClose>
                    </BottomSheetHeader>
                    <BottomSheetBody className="px-4">
                        <Field>
                            <FieldLabel htmlFor={`availability-reason-${outletId}`}>Alasan (opsional)</FieldLabel>
                            <Input
                                id={`availability-reason-${outletId}`}
                                value={reason}
                                maxLength={255}
                                placeholder="cth. Stok habis"
                                onChange={(event) => setReason(event.target.value)}
                                className="h-11"
                            />
                        </Field>
                    </BottomSheetBody>
                    <BottomSheetFooter className="flex-row">
                        <Button
                            size="lg"
                            type="button"
                            variant="outline"
                            className="flex-1"
                            disabled={availabilityMutation.isPending}
                            onClick={() => submitUnavailable(false)}
                        >
                            Lewati
                        </Button>
                        <Button
                            size="lg"
                            type="button"
                            className="flex-1"
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
                    </BottomSheetFooter>
                </BottomSheetContent>
            </BottomSheet>
        </>
    )
}
