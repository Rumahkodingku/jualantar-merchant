import { useState } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Spinner } from "~/components/ui/spinner"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"

import { ConfirmDialog } from "../common/confirm-dialog"
import { OutletAssignmentRow } from "./outlet-assignment-row"
import { useOutlets } from "../../services/product-outlets/product-outlet.queries"
import {
    useRemoveProductOutlet,
    useReplaceProductOutlets,
} from "../../services/product-outlets/product-outlet.mutations"
import { catalogErrorMessage } from "../../utils/api-error"
import { notifyError, notifySuccess } from "~/lib/notify"
import type { OutletProductAssignment } from "../../types/catalog.types"

export function OutletAssignment({
    productId,
    assignments,
}: {
    productId: string
    assignments: OutletProductAssignment[]
}) {
    const outletsQuery = useOutlets()
    const replaceMutation = useReplaceProductOutlets(productId)
    const removeMutation = useRemoveProductOutlet(productId)
    const [assignOpen, setAssignOpen] = useState(false)
    const [pendingRemove, setPendingRemove] = useState<OutletProductAssignment | null>(null)
    const [selectedIds, setSelectedIds] = useState<string[]>([])

    const outlets = outletsQuery.data ?? []
    const assignedOutletIds = assignments.map((assignment) => assignment.outlet_id)
    const availableToAssign = outlets.filter((outlet) => !assignedOutletIds.includes(outlet.id))

    function openAssign() {
        setSelectedIds(assignedOutletIds)
        setAssignOpen(true)
    }

    function toggleOutlet(outletId: string) {
        setSelectedIds((current) =>
            current.includes(outletId) ? current.filter((id) => id !== outletId) : [...current, outletId]
        )
    }

    function handleAssignSave() {
        replaceMutation.mutate(selectedIds, {
            onSuccess: () => {
                setAssignOpen(false)
                notifySuccess("Penugasan outlet diperbarui")
            },
            onError: (error) => notifyError(catalogErrorMessage(error, "Gagal memperbarui penugasan outlet")),
        })
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                    <Text variant="sm" weight="medium">
                        Produk tersedia di:
                    </Text>
                    <Text variant="xs" className="text-muted-foreground">
                        Assignment = produk ditugaskan ke outlet. Availability = produk sedang tersedia.
                    </Text>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={openAssign} disabled={outlets.length === 0}>
                    <PlusIcon /> Kelola outlet
                </Button>
            </div>

            {assignments.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-5">
                    <Text variant="sm" className="text-muted-foreground">
                        Belum ada outlet yang ditugaskan untuk produk ini.
                    </Text>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {assignments.map((assignment) => (
                        <OutletAssignmentRow
                            key={assignment.id}
                            productId={productId}
                            assignment={assignment}
                            onRemove={() => setPendingRemove(assignment)}
                        />
                    ))}
                </div>
            )}

            <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Kelola outlet</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                        {outlets.map((outlet) => {
                            const checked = selectedIds.includes(outlet.id)

                            return (
                                <label
                                    key={outlet.id}
                                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 hover:bg-muted/50"
                                >
                                    <span className="flex min-w-0 flex-col">
                                        <Text variant="sm" weight="medium" truncate>
                                            {outlet.name}
                                        </Text>
                                        <Text variant="xs" className="text-muted-foreground">
                                            {checked ? "Ditugaskan" : "Tidak ditugaskan"}
                                        </Text>
                                    </span>
                                    <Switch checked={checked} onCheckedChange={() => toggleOutlet(outlet.id)} />
                                </label>
                            )
                        })}

                        {availableToAssign.length === 0 && assignments.length > 0 ? (
                            <Text variant="xs" className="text-muted-foreground">
                                Seluruh outlet sudah ditugaskan.
                            </Text>
                        ) : null}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setAssignOpen(false)}>
                            Batal
                        </Button>
                        <Button type="button" disabled={replaceMutation.isPending} onClick={handleAssignSave}>
                            {replaceMutation.isPending ? (
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

            <ConfirmDialog
                open={pendingRemove !== null}
                onOpenChange={(open) => (!open ? setPendingRemove(null) : undefined)}
                title="Hapus penugasan outlet?"
                description={
                    <>
                        Produk tidak lagi ditugaskan ke outlet &ldquo;
                        {pendingRemove?.outlet?.name ?? pendingRemove?.outlet_id}&rdquo;.
                    </>
                }
                isPending={removeMutation.isPending}
                onConfirm={() => {
                    if (pendingRemove === null) {
                        return
                    }

                    removeMutation.mutate(pendingRemove.outlet_id, {
                        onSuccess: () => {
                            setPendingRemove(null)
                            notifySuccess("Penugasan dihapus")
                        },
                        onError: (error) => notifyError(catalogErrorMessage(error, "Gagal menghapus penugasan")),
                    })
                }}
            />
        </div>
    )
}
