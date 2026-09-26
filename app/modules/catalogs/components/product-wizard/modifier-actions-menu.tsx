import { ArrowDownIcon, ArrowUpIcon, CopyIcon, MoreVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

export function ModifierActionsMenu({
    label,
    canMoveUp,
    canMoveDown,
    onEdit,
    onDuplicate,
    onMove,
    onDelete,
}: {
    label: string
    canMoveUp: boolean
    canMoveDown: boolean
    onEdit: () => void
    onDuplicate: () => void
    onMove: (direction: -1 | 1) => void
    onDelete: () => void
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={<Button type="button" variant="ghost" size="icon-xs" aria-label={`Aksi untuk ${label}`} />}
            >
                <MoreVerticalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                    <PencilIcon /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                    <CopyIcon /> Duplikat
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled={!canMoveUp} onClick={() => onMove(-1)}>
                    <ArrowUpIcon /> Pindah ke atas
                </DropdownMenuItem>
                <DropdownMenuItem disabled={!canMoveDown} onClick={() => onMove(1)}>
                    <ArrowDownIcon /> Pindah ke bawah
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                    <Trash2Icon /> Hapus
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
