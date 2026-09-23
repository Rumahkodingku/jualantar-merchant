import { PlusIcon, UsersIcon } from "lucide-react"
import { useState } from "react"
import { useParams } from "react-router"
import { ErrorState } from "~/components/error-state"
import { Button } from "~/components/ui/button"
import { getApiErrorMessage } from "~/lib/api-form"
import { CAP } from "~/modules/authorization"
import { EmptyState } from "../components/common/empty-state"
import { ListSkeleton } from "../components/common/list-skeleton"
import { OutletScopedPage } from "../components/layout/outlet-scoped-page"
import { EmployeeCreateSheet } from "../components/employees/employee-create-sheet"
import { EmployeeList } from "../components/employees/employee-list"
import { EmployeeRoleSheet } from "../components/employees/employee-role-sheet"
import { RemoveEmployeeDialog } from "../components/employees/remove-employee-dialog"
import { useOutletEmployees } from "../services/merchant-operations.queries"
import { useOperationsPermissions } from "../utils/permissions"
import type { OutletEmployee } from "../types/merchant-operations.types"

export function OutletEmployeesPage() {
    const { outlet: outletId } = useParams<{ outlet: string }>()
    const permissions = useOperationsPermissions(outletId)
    const query = useOutletEmployees(outletId, { enabled: permissions.canViewEmployees })

    const [createOpen, setCreateOpen] = useState(false)
    const [roleTarget, setRoleTarget] = useState<OutletEmployee | null>(null)
    const [removeTarget, setRemoveTarget] = useState<OutletEmployee | null>(null)

    return (
        <OutletScopedPage
            outletId={outletId}
            title="Karyawan"
            description="Karyawan hanya memiliki akses ke outlet ini."
            capability={CAP.outletUsersView}
        >
            {(outlet) => (
                <>
                    {query.isPending ? (
                        <ListSkeleton rows={3} className="h-16" />
                    ) : query.isError ? (
                        <ErrorState
                            title="Gagal memuat karyawan"
                            description={getApiErrorMessage(query.error)}
                            onRetry={() => void query.refetch()}
                        />
                    ) : query.data.length === 0 ? (
                        <EmptyState
                            icon={UsersIcon}
                            title="Belum ada karyawan"
                            description="Tambahkan karyawan untuk membantu mengelola outlet ini."
                            action={
                                permissions.canAssignEmployee ? (
                                    <Button
                                        type="button"
                                        size="lg"
                                        className="h-11"
                                        onClick={() => setCreateOpen(true)}
                                    >
                                        <PlusIcon /> Tambah karyawan
                                    </Button>
                                ) : undefined
                            }
                        />
                    ) : (
                        <>
                            <EmployeeList
                                employees={query.data}
                                canChangeRole={permissions.canUpdateEmployeeRole}
                                canRemove={permissions.canRemoveEmployee}
                                onChangeRole={setRoleTarget}
                                onRemove={setRemoveTarget}
                            />

                            {permissions.canAssignEmployee ? (
                                <Button
                                    type="button"
                                    size="lg"
                                    className="h-11 w-full"
                                    onClick={() => setCreateOpen(true)}
                                >
                                    <PlusIcon /> Tambah karyawan
                                </Button>
                            ) : null}
                        </>
                    )}

                    {permissions.canAssignEmployee ? (
                        <EmployeeCreateSheet outletId={outlet.id} open={createOpen} onOpenChange={setCreateOpen} />
                    ) : null}

                    <EmployeeRoleSheet
                        outletId={outlet.id}
                        employee={roleTarget}
                        open={roleTarget !== null}
                        onOpenChange={(open) => setRoleTarget(open ? roleTarget : null)}
                    />

                    <RemoveEmployeeDialog
                        outletId={outlet.id}
                        employee={removeTarget}
                        open={removeTarget !== null}
                        onOpenChange={(open) => setRemoveTarget(open ? removeTarget : null)}
                    />
                </>
            )}
        </OutletScopedPage>
    )
}
