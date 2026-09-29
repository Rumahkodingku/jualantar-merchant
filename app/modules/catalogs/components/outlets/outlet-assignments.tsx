import { useState } from "react"

import { ConfirmDialog } from "../common/confirm-dialog"
import { OutletAssignmentRow } from "./outlet-assignment-row"
import type { OutletProductAssignment } from "../../types"

/**
 * The per-outlet management under the wizard's outlet picker.
 *
 * The picker answers "which outlets does this product belong in", and this
 * answers the two questions that can only be asked of one outlet at a time: is
 * the assignment live, and is the product actually in stock there. Those are
 * written straight through rather than held for the save, because each is its
 * own call against a single assignment and holding them would mean the merchant
 * could not mark something out of stock without re-saving the whole product.
 *
 * Removal is the exception — it only reports the wish, and the assignment really
 * goes when the wizard is saved, so changing one's mind costs nothing.
 */
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
