import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon, MoreVerticalIcon, PencilIcon, PowerIcon, Trash2Icon } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

import { StatusBadge } from "../status-badge"
import type { CatalogCategory } from "../../types/catalog.types"

export type CategoryRowAction = "edit" | "status" | "delete"

export function CategoryRow({
    category,
    reorderMode,
    onAction,
}: {
    category: CatalogCategory
    reorderMode: boolean
    onAction: (action: CategoryRowAction) => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: category.id,
        disabled: !reorderMode,
    })

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={cn(
                "flex items-center gap-2 rounded-2xl border bg-card px-3 py-3 ring-1 ring-foreground/5",
                isDragging && "relative z-10 opacity-70"
            )}
            {...attributes}
        >
            {reorderMode ? (
                <button
                    type="button"
                    aria-label={`Seret ${category.name} untuk mengurutkan`}
                    className="flex w-6 shrink-0 cursor-grab items-center justify-center text-muted-foreground active:cursor-grabbing"
                    {...listeners}
                >
                    <GripVerticalIcon aria-hidden="true" className="size-4" />
                </button>
            ) : null}

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Text variant="sm" weight="medium" truncate>
                    {category.name}
                </Text>
                {category.description != null && category.description !== "" ? (
                    <Text variant="xs" className="truncate text-muted-foreground">
                        {category.description}
                    </Text>
                ) : null}
            </div>

            <StatusBadge status={category.status} className="shrink-0" />

            {!reorderMode ? (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Aksi untuk ${category.name}`}
                            />
                        }
                    >
                        <MoreVerticalIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onAction("edit")}>
                            <PencilIcon /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAction("status")}>
                            <PowerIcon /> {category.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => onAction("delete")}>
                            <Trash2Icon /> Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : null}
        </div>
    )
}
