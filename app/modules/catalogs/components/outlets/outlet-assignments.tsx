import { useState } from "react"
import { ConfirmDialog } from "../common/confirm-dialog"
import { OutletAssignmentRow } from "./outlet-assignment-row"
import type { OutletProductAssignment } from "../../types"

export function OutletAssignments({
    productId,
    assignments,
    onRemove,
}: {
    productId: string
    assignments: OutletProductAssignment[]
    onRemove: (outletId: string) => void
}) {
    const [pending, setPending] = useState<OutletProductAssignment | null>(null)

    if (assignments.length === 0) {
        return null
    }

    return (
        <>
            <div className="flex flex-col gap-2">
                {assignments.map((assignment) => (
                    <OutletAssignmentRow
                        key={assignment.id}
                        productId={productId}
                        assignment={assignment}
                        onRemove={() => setPending(assignment)}
                    />
                ))}
            </div>

            <ConfirmDialog
                open={pending !== null}
                onOpenChange={(open) => (!open ? setPending(null) : undefined)}
                title="Hapus penugasan outlet?"
                description={
                    <>
                        Produk tidak lagi ditugaskan ke outlet &ldquo;
                        {pending?.outlet?.name ?? pending?.outlet_id}&rdquo;. Penugasan baru berlaku setelah produk
                        disimpan.
                    </>
                }
                confirmLabel="Hapus penugasan"
                pendingLabel="Menghapus…"
                onConfirm={() => {
                    if (pending === null) {
                        return
                    }

                    onRemove(pending.outlet_id)
                    setPending(null)
                }}
            />
        </>
    )
}
