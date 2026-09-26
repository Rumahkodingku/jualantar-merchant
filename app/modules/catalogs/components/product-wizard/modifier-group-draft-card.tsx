import { useState } from "react"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronDownIcon, GripVerticalIcon, PlusIcon } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"
import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

import { ModifierActionsMenu } from "./modifier-actions-menu"
import { ModifierDraftRow } from "./modifier-draft-row"
import type { GroupDraft, ModifierDraft } from "./types"

function groupMetadata(group: GroupDraft): { required: string; selection: string } {
    const required = group.is_required ? "Wajib" : "Opsional"

    if (group.selection_type === "single") {
        return { required, selection: "Pilih 1" }
    }

    return {
        required,
        selection: group.max_selection == null ? "Pilih beberapa" : `Pilih hingga ${group.max_selection}`,
    }
}

export function ModifierGroupDraftCard({
    group,
    canMoveUp,
    canMoveDown,
    onEditGroup,
    onDuplicateGroup,
    onDeleteGroup,
    onMoveGroup,
    onAddModifier,
    onEditModifier,
    onDuplicateModifier,
    onDeleteModifier,
    onMoveModifier,
}: {
    group: GroupDraft
    canMoveUp: boolean
    canMoveDown: boolean
    onEditGroup: () => void
    onDuplicateGroup: () => void
    onDeleteGroup: () => void
    onMoveGroup: (direction: -1 | 1) => void
    onAddModifier: () => void
    onEditModifier: (modifier: ModifierDraft) => void
    onDuplicateModifier: (modifier: ModifierDraft) => void
    onDeleteModifier: (modifier: ModifierDraft) => void
    onMoveModifier: (modifier: ModifierDraft, direction: -1 | 1) => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.key })
    const [open, setOpen] = useState(true)
    const metadata = groupMetadata(group)

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={cn(isDragging && "relative z-10")}
        >
            <Collapsible
                open={open}
                onOpenChange={setOpen}
                className={cn(
                    "overflow-hidden rounded-xl border bg-card transition-shadow",
                    isDragging && "opacity-80 shadow-lg ring-2 ring-primary/30"
                )}
            >
                <div className="flex items-center gap-1 py-2 pr-1 pl-1">
                    <button
                        type="button"
                        aria-label={`Seret ${group.name} untuk mengurutkan`}
                        className="flex w-6 shrink-0 cursor-grab items-center justify-center self-stretch text-muted-foreground active:cursor-grabbing"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVerticalIcon aria-hidden="true" className="size-4" />
                    </button>

                    <CollapsibleTrigger
                        type="button"
                        className="group flex min-w-0 flex-1 items-start gap-2 rounded-lg px-1 py-0.5 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50"
                    >
                        <span className="flex min-w-0 flex-1 flex-col gap-1">
                            <Text as="span" variant="sm" weight="semibold" className="block truncate">
                                {group.name}
                            </Text>
                            {group.description !== "" ? (
                                <Text as="span" variant="xs" className="block text-muted-foreground">
                                    {group.description}
                                </Text>
                            ) : null}
                            <span className="flex flex-wrap items-center gap-1">
                                <Badge variant={group.is_required ? "default" : "secondary"}>{metadata.required}</Badge>
                                <Badge variant="outline">{metadata.selection}</Badge>
                            </span>
                        </span>
                        <ChevronDownIcon
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-data-panel-open:rotate-180"
                        />
                    </CollapsibleTrigger>

                    <ModifierActionsMenu
                        label={`modifier group ${group.name}`}
                        canMoveUp={canMoveUp}
                        canMoveDown={canMoveDown}
                        onEdit={onEditGroup}
                        onDuplicate={onDuplicateGroup}
                        onMove={onMoveGroup}
                        onDelete={onDeleteGroup}
                    />
                </div>

                <CollapsibleContent>
                    <div className="border-t px-2 py-1.5">
                        {group.modifiers.length === 0 ? (
                            <Text variant="xs" className="px-1 py-3 text-muted-foreground">
                                Belum ada pilihan
                            </Text>
                        ) : (
                            <SortableContext
                                items={group.modifiers.map((modifier) => modifier.key)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="divide-y divide-border/60">
                                    {group.modifiers.map((modifier, index) => (
                                        <ModifierDraftRow
                                            key={modifier.key}
                                            modifier={modifier}
                                            canMoveUp={index > 0}
                                            canMoveDown={index < group.modifiers.length - 1}
                                            onEdit={() => onEditModifier(modifier)}
                                            onDuplicate={() => onDuplicateModifier(modifier)}
                                            onMove={(direction) => onMoveModifier(modifier, direction)}
                                            onDelete={() => onDeleteModifier(modifier)}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        )}

                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="mt-1 text-primary hover:text-primary"
                            onClick={onAddModifier}
                        >
                            <PlusIcon /> Tambah pilihan
                        </Button>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}
