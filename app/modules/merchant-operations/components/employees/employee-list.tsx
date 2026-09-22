import { EmployeeRow } from "./employee-row"
import type { OutletEmployee } from "../../types/merchant-operations.types"

export function EmployeeList({
    employees,
    canChangeRole,
    canRemove,
    onChangeRole,
    onRemove,
}: {
    employees: OutletEmployee[]
    canChangeRole: boolean
    canRemove: boolean
    onChangeRole: (employee: OutletEmployee) => void
    onRemove: (employee: OutletEmployee) => void
}) {
    return (
        <div className="flex flex-col divide-y overflow-hidden rounded-2xl border bg-card">
            {employees.map((employee) => (
                <EmployeeRow
                    key={employee.user?.id ?? `${employee.role}-${employee.assigned_at}`}
                    employee={employee}
                    canChangeRole={canChangeRole}
                    canRemove={canRemove}
                    onChangeRole={onChangeRole}
                    onRemove={onRemove}
                />
            ))}
        </div>
    )
}
