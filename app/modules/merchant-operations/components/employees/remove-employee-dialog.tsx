import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { authorizationErrorMessage } from "~/modules/authorization"

import { useRemoveOutletEmployee } from "../../services/merchant-operations.mutations"
import { notifyError, notifySuccess } from "~/lib/notify"
import { OUTLET_ROLE_LABEL } from "../../utils/outlet-status"
import type { OutletEmployee } from "../../types/merchant-operations.types"

export function RemoveEmployeeDialog({
    outletId,
    employee,
    open,
    onOpenChange,
}: {
    outletId: string
    employee: OutletEmployee | null
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const mutation = useRemoveOutletEmployee(outletId)

    const email = employee?.user?.email ?? "karyawan ini"
    const roleLabel = employee === null ? "" : OUTLET_ROLE_LABEL[employee.role]

    function remove() {
        if (employee?.user === null || employee === null) {
            return
        }

        mutation.mutate(employee.user.id, {
            onSuccess: () => {
                notifySuccess(`${email} dihapus dari outlet.`)
                onOpenChange(false)
            },
            onError: (error) => {
                notifyError("Gagal menghapus karyawan", authorizationErrorMessage(error))
            },
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogTitle>Hapus karyawan ini?</AlertDialogTitle>
                    <AlertDialogDescription>
                        {email} ({roleLabel}) akan kehilangan akses ke outlet ini. Akun penggunanya tetap ada dan dapat
                        ditugaskan kembali kapan saja.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <Button type="button" variant="destructive" disabled={mutation.isPending} onClick={remove}>
                        {mutation.isPending ? (
                            <>
                                <Spinner /> Menghapus…
                            </>
                        ) : (
                            "Ya, hapus"
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
