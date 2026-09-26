import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon } from "lucide-react"

import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

import { formatCurrency } from "../../utils/format-currency"
import { ModifierActionsMenu } from "./modifier-actions-menu"
import type { ModifierDraft } from "./types"

export function ModifierDraftRow({
    modifier,
    canMoveUp,
    canMoveDown,
    onEdit,
    onDuplicate,
    onMove,
    onDelete,
}: {
    modifier: ModifierDraft
    canMoveUp: boolean
    canMoveDown: boolean
    onEdit: () => void
    onDuplicate: () => void
    onMove: (direction: -1 | 1) => void
    onDelete: () => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: modifier.key })

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={cn(
                "flex min-h-12 items-center gap-1.5 px-0.5 transition-colors hover:bg-muted/50",
                isDragging && "relative z-10 bg-muted/50 opacity-80"
            )}
        >
            <button
                type="button"
                aria-label={`Seret ${modifier.name} untuk mengurutkan`}
                className="flex w-6 shrink-0 cursor-grab items-center justify-center self-stretch text-muted-foreground active:cursor-grabbing"
                {...attributes}
                {...listeners}
            >
                <GripVerticalIcon aria-hidden="true" className="size-4" />
            </button>

            <Text variant="sm" truncate className="min-w-0 flex-1">
                {modifier.name}
            </Text>

            <Text variant="xs" className="shrink-0 text-muted-foreground tabular-nums">
                {formatCurrency(modifier.price)}
            </Text>

            <ModifierActionsMenu
                label={`pilihan ${modifier.name}`}
                canMoveUp={canMoveUp}
                canMoveDown={canMoveDown}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onMove={onMove}
                onDelete={onDelete}
            />
        </div>
    )
}
