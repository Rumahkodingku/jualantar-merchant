import { useEffect, useState } from "react"

import { Button } from "~/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "~/components/ui/sheet"
import { Spinner } from "~/components/ui/spinner"
import { authorizationErrorMessage } from "~/modules/authorization"
import { ChoiceCards } from "~/modules/merchant-registration"

import { useChangeOutletEmployeeRole } from "../../services/merchant-operations.mutations"
import { notifyError, notifySuccess } from "../../utils/notify"
import { OUTLET_ROLE_DESCRIPTION, OUTLET_ROLE_LABEL, OUTLET_ROLE_OPTIONS } from "../../utils/outlet-status"
import type { OutletEmployee, OutletUserRole } from "../../types/merchant-operations.types"

export function EmployeeRoleSheet({
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
    const mutation = useChangeOutletEmployeeRole(outletId)
    const [role, setRole] = useState<OutletUserRole>("outlet_staff")

    useEffect(() => {
        if (open && employee !== null) {
            setRole(employee.role)
        }
    }, [open, employee])

    const email = employee?.user?.email ?? "karyawan ini"

    function save() {
        if (employee?.user === null || employee === null) {
            return
        }

        mutation.mutate(
            { userId: employee.user.id, role },
            {
                onSuccess: () => {
                    notifySuccess(`Peran ${email} diperbarui menjadi ${OUTLET_ROLE_LABEL[role]}.`)
                    onOpenChange(false)
                },
                onError: (error) => {
                    notifyError("Gagal mengubah peran", authorizationErrorMessage(error))
                },
            }
        )
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom">
                <SheetHeader>
                    <SheetTitle>Ubah peran</SheetTitle>
                    <SheetDescription>{email}</SheetDescription>
                </SheetHeader>

                <div className="px-4">
                    <ChoiceCards
                        options={OUTLET_ROLE_OPTIONS.map((option) => ({
                            ...option,
                            description: OUTLET_ROLE_DESCRIPTION[option.value],
                        }))}
                        value={role}
                        onChange={setRole}
                        disabled={mutation.isPending}
                    />
                </div>

                <SheetFooter>
                    <Button
                        type="button"
                        size="lg"
                        className="h-11 w-full text-sm font-semibold"
                        disabled={mutation.isPending || role === employee?.role}
                        onClick={save}
                    >
                        {mutation.isPending ? (
                            <>
                                <Spinner /> Menyimpan…
                            </>
                        ) : (
                            "Simpan peran"
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="h-11 w-full"
                        disabled={mutation.isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        Batal
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
