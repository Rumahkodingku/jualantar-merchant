import { useState } from "react"
import { PlusIcon, Trash2Icon } from "lucide-react"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog"
import { Spinner } from "~/components/ui/spinner"
import { Field, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"

import { StatusBadge } from "./status-badge"
import { useOutlets } from "../services/catalog.queries"
import {
    useRemoveProductOutlet,
    useReplaceProductOutlets,
    useSetOutletAssignmentStatus,
    useSetOutletAvailability,
} from "../services/catalog.mutations"
import { catalogErrorMessage } from "../utils/api-error"
import { AVAILABILITY_LABEL, availabilityTone } from "../utils/labels"
import { notifyError, notifySuccess } from "../utils/notify"
import { Badge } from "~/components/ui/badge"
import { cn } from "~/lib/utils"
import type { AvailabilityStatus, OutletProductAssignment } from "../types/catalog.types"

function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
    return (
        <Badge
            variant="outline"
            className={cn(
                "gap-1.5 border-transparent",
                availabilityTone(status) === "positive"
                    ? "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
            )}
        >
            <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
            {AVAILABILITY_LABEL[status]}
        </Badge>
    )
}

function AssignmentStatusControl({
    productId,
    assignment,
}: {
    productId: string
    assignment: OutletProductAssignment
}) {
    const statusMutation = useSetOutletAssignmentStatus(productId, assignment.outlet_id)

    return (
        <Switch
            checked={assignment.status === "active"}
            disabled={statusMutation.isPending}
            aria-label={`Assignment ${assignment.outlet?.name ?? assignment.outlet_id}`}
            onCheckedChange={(checked) =>
                statusMutation.mutate(checked === true ? "active" : "inactive", {
                    onSuccess: () => notifySuccess("Status assignment diperbarui"),
                    onError: (error) => notifyError(catalogErrorMessage(error, "Gagal memperbarui status assignment")),
                })
            }
        />
    )
}

function AvailabilityControl({ productId, assignment }: { productId: string; assignment: OutletProductAssignment }) {
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
                        <div
                            key={assignment.id}
                            className="flex flex-col gap-3 rounded-xl border bg-card p-3 ring-1 ring-foreground/5"
                        >
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
                                <AssignmentStatusControl productId={productId} assignment={assignment} />
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t pt-2.5">
                                <div className="flex flex-col">
                                    <Text variant="xs" weight="medium">
                                        Availability
                                    </Text>
                                    <Text variant="xs" className="text-muted-foreground">
                                        {assignment.availability_status === "unavailable" &&
                                        assignment.unavailable_reason != null
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
                                        onClick={() => setPendingRemove(assignment)}
                                    >
                                        <Trash2Icon />
                                    </Button>
                                </div>
                            </div>
                        </div>
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

            <AlertDialog
                open={pendingRemove !== null}
                onOpenChange={(open) => (!open ? setPendingRemove(null) : undefined)}
            >
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus penugasan outlet?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Produk tidak lagi ditugaskan ke outlet &ldquo;
                            {pendingRemove?.outlet?.name ?? pendingRemove?.outlet_id}&rdquo;.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={removeMutation.isPending}
                            onClick={() => {
                                if (pendingRemove === null) {
                                    return
                                }

                                removeMutation.mutate(pendingRemove.outlet_id, {
                                    onSuccess: () => {
                                        setPendingRemove(null)
                                        notifySuccess("Penugasan dihapus")
                                    },
                                    onError: (error) =>
                                        notifyError(catalogErrorMessage(error, "Gagal menghapus penugasan")),
                                })
                            }}
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
