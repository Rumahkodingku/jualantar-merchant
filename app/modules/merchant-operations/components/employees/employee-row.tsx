import { MoreVerticalIcon, ShieldCheckIcon, Trash2Icon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
import { Text } from "~/components/ui/text"

import { StatusBadge } from "~/components/status-badge"
import { OUTLET_ROLE_LABEL } from "../../utils/outlet-status"
import { formatDate } from "../../utils/format"
import type { OutletEmployee } from "../../types/merchant-operations.types"

export function EmployeeRow({
    employee,
    canChangeRole,
    canRemove,
    onChangeRole,
    onRemove,
}: {
    employee: OutletEmployee
    canChangeRole: boolean
    canRemove: boolean
    onChangeRole: (employee: OutletEmployee) => void
    onRemove: (employee: OutletEmployee) => void
}) {
    const email = employee.user?.email ?? "Pengguna tidak ditemukan"
    const initial = email.slice(0, 1).toUpperCase()
    const subtitle = employee.user?.phone ?? `Ditugaskan ${formatDate(employee.assigned_at)}`

    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
            >
                {initial}
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Text variant="sm" weight="medium" truncate>
                    {email}
                </Text>
                <Text variant="xs" className="text-muted-foreground" truncate>
                    {subtitle}
                </Text>
            </div>

            <StatusBadge tone={employee.role === "outlet_manager" ? "positive" : "neutral"}>
                {OUTLET_ROLE_LABEL[employee.role]}
            </StatusBadge>

            {canChangeRole || canRemove ? (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button type="button" variant="ghost" size="icon-sm" aria-label={`Aksi untuk ${email}`} />
                        }
                    >
                        <MoreVerticalIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {canChangeRole ? (
                            <DropdownMenuItem onClick={() => onChangeRole(employee)}>
                                <ShieldCheckIcon /> Ubah peran
                            </DropdownMenuItem>
                        ) : null}
                        {canRemove ? (
                            <DropdownMenuItem variant="destructive" onClick={() => onRemove(employee)}>
                                <Trash2Icon /> Hapus
                            </DropdownMenuItem>
                        ) : null}
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : null}
        </div>
    )
}
