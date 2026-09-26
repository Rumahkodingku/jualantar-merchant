import { useMemo, useState } from "react"
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { PlusIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

import { ConfirmDialog } from "../common/confirm-dialog"
import { ModifierDraftDialog } from "./modifier-draft-dialog"
import { ModifierGroupDraftCard } from "./modifier-group-draft-card"
import { ModifierGroupDraftDialog } from "./modifier-group-draft-dialog"
import { draftKey } from "./utils"
import type { GroupDraft, GroupDraftPayload, ModifierDraft, ModifierDraftPayload } from "./types"

type PendingDelete = { scope: "group" | "option"; groupKey: string; modifier?: ModifierDraft }

export function ModifierGroupDraftEditor({
    groups,
    onChange,
}: {
    groups: GroupDraft[]
    onChange: (groups: GroupDraft[]) => void
}) {
    const [groupDialog, setGroupDialog] = useState<{ open: boolean; group?: GroupDraft }>({ open: false })
    const [modifierDialog, setModifierDialog] = useState<{
        open: boolean
        groupKey: string
        modifier?: ModifierDraft
    }>({ open: false, groupKey: "" })
    const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const groupIds = useMemo(() => groups.map((group) => group.key), [groups])
    const modifierOwner = useMemo(() => {
        const owner = new Map<string, string>()

        groups.forEach((group) => {
            group.modifiers.forEach((modifier) => owner.set(modifier.key, group.key))
        })

        return owner
    }, [groups])

    function submitGroup(payload: GroupDraftPayload) {
        const editing = groupDialog.group

        if (editing === undefined) {
            onChange([...groups, { key: draftKey("grp"), status: "active", modifiers: [], ...payload }])
        } else {
            onChange(groups.map((group) => (group.key === editing.key ? { ...group, ...payload } : group)))
        }

        setGroupDialog({ open: false })
    }

    function submitModifier(payload: ModifierDraftPayload) {
        const { groupKey, modifier } = modifierDialog

        onChange(
            groups.map((group) => {
                if (group.key !== groupKey) {
                    return group
                }

                if (modifier === undefined) {
                    return {
                        ...group,
                        modifiers: [...group.modifiers, { key: draftKey("mod"), status: "active", ...payload }],
                    }
                }

                return {
                    ...group,
                    modifiers: group.modifiers.map((entry) =>
                        entry.key === modifier.key ? { ...entry, ...payload } : entry
                    ),
                }
            })
        )

        setModifierDialog({ open: false, groupKey: "" })
    }

    function deleteModifier(groupKey: string, modifier: ModifierDraft) {
        onChange(
            groups.map((group) =>
                group.key === groupKey
                    ? { ...group, modifiers: group.modifiers.filter((entry) => entry.key !== modifier.key) }
                    : group
            )
        )
    }

    function duplicateModifier(groupKey: string, modifier: ModifierDraft) {
        onChange(
            groups.map((group) => {
                if (group.key !== groupKey) {
                    return group
                }

                const index = group.modifiers.findIndex((entry) => entry.key === modifier.key)

                if (index < 0) {
                    return group
                }

                const modifiers = [...group.modifiers]

                modifiers.splice(index + 1, 0, { ...modifier, key: draftKey("mod") })

                return { ...group, modifiers }
            })
        )
    }

    function duplicateGroup(group: GroupDraft) {
        const index = groups.findIndex((entry) => entry.key === group.key)

        if (index < 0) {
            return
        }

        const copy: GroupDraft = {
            ...group,
            key: draftKey("grp"),
            modifiers: group.modifiers.map((modifier) => ({ ...modifier, key: draftKey("mod") })),
        }
        const next = [...groups]

        next.splice(index + 1, 0, copy)
        onChange(next)
    }

    function moveGroup(group: GroupDraft, direction: -1 | 1) {
        const index = groups.findIndex((entry) => entry.key === group.key)
        const target = index + direction

        if (index < 0 || target < 0 || target >= groups.length) {
            return
        }

        onChange(arrayMove(groups, index, target))
    }

    function moveModifier(groupKey: string, modifier: ModifierDraft, direction: -1 | 1) {
        onChange(
            groups.map((group) => {
                if (group.key !== groupKey) {
                    return group
                }

                const index = group.modifiers.findIndex((entry) => entry.key === modifier.key)
                const target = index + direction

                if (index < 0 || target < 0 || target >= group.modifiers.length) {
                    return group
                }

                return { ...group, modifiers: arrayMove(group.modifiers, index, target) }
            })
        )
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event

        if (over == null || active.id === over.id) {
            return
        }

        const activeId = String(active.id)
        const overId = String(over.id)

        if (groupIds.includes(activeId)) {
            // A group can be dropped over an option row, so resolve that to its owning group.
            const target = groupIds.includes(overId) ? overId : modifierOwner.get(overId)

            if (target === undefined || target === activeId) {
                return
            }

            const oldIndex = groupIds.indexOf(activeId)
            const newIndex = groupIds.indexOf(target)

            if (oldIndex < 0 || newIndex < 0) {
                return
            }

            onChange(arrayMove(groups, oldIndex, newIndex))
            return
        }

        const ownerKey = modifierOwner.get(activeId)
        const group = groups.find((entry) => entry.key === ownerKey)

        if (group === undefined) {
            return
        }

        const ids = group.modifiers.map((modifier) => modifier.key)
        const oldIndex = ids.indexOf(activeId)
        const newIndex = ids.indexOf(overId)

        if (oldIndex < 0 || newIndex < 0) {
            return
        }

        onChange(
            groups.map((entry) =>
                entry.key === group.key
                    ? { ...entry, modifiers: arrayMove(entry.modifiers, oldIndex, newIndex) }
                    : entry
            )
        )
    }

    function confirmDelete() {
        if (pendingDelete === null) {
            return
        }

        if (pendingDelete.scope === "group") {
            onChange(groups.filter((group) => group.key !== pendingDelete.groupKey))
        } else if (pendingDelete.modifier !== undefined) {
            deleteModifier(pendingDelete.groupKey, pendingDelete.modifier)
        }

        setPendingDelete(null)
    }

    const pendingGroup = groups.find((group) => group.key === pendingDelete?.groupKey)

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="flex flex-col gap-3">
                {groups.length === 0 ? (
                    <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed px-4 py-6">
                        <Text variant="sm" className="text-muted-foreground">
                            Customization bersifat opsional. Tambahkan modifier group jika diperlukan.
                        </Text>
                    </div>
                ) : (
                    <SortableContext items={groupIds} strategy={verticalListSortingStrategy}>
                        <div className="flex flex-col gap-3">
                            {groups.map((group, index) => (
                                <ModifierGroupDraftCard
                                    key={group.key}
                                    group={group}
                                    canMoveUp={index > 0}
                                    canMoveDown={index < groups.length - 1}
                                    onEditGroup={() => setGroupDialog({ open: true, group })}
                                    onDuplicateGroup={() => duplicateGroup(group)}
                                    onDeleteGroup={() => setPendingDelete({ scope: "group", groupKey: group.key })}
                                    onMoveGroup={(direction) => moveGroup(group, direction)}
                                    onAddModifier={() => setModifierDialog({ open: true, groupKey: group.key })}
                                    onEditModifier={(modifier) =>
                                        setModifierDialog({ open: true, groupKey: group.key, modifier })
                                    }
                                    onDuplicateModifier={(modifier) => duplicateModifier(group.key, modifier)}
                                    onDeleteModifier={(modifier) =>
                                        setPendingDelete({ scope: "option", groupKey: group.key, modifier })
                                    }
                                    onMoveModifier={(modifier, direction) =>
                                        moveModifier(group.key, modifier, direction)
                                    }
                                />
                            ))}
                        </div>
                    </SortableContext>
                )}

                <Button
                    type="button"
                    size="sm"
                    variant={groups.length === 0 ? "default" : "outline"}
                    className={cn("self-start", groups.length > 0 && "border-dashed")}
                    onClick={() => setGroupDialog({ open: true })}
                >
                    <PlusIcon /> Tambah modifier group
                </Button>
            </div>

            {groupDialog.open ? (
                <ModifierGroupDraftDialog
                    group={groupDialog.group}
                    onClose={() => setGroupDialog({ open: false })}
                    onSubmit={submitGroup}
                />
            ) : null}

            {modifierDialog.open ? (
                <ModifierDraftDialog
                    modifier={modifierDialog.modifier}
                    onClose={() => setModifierDialog({ open: false, groupKey: "" })}
                    onSubmit={submitModifier}
                />
            ) : null}

            <ConfirmDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingDelete(null)
                    }
                }}
                title={pendingDelete?.scope === "group" ? "Hapus modifier group?" : "Hapus pilihan?"}
                description={
                    pendingDelete?.scope === "group"
                        ? `Modifier group "${pendingGroup?.name ?? ""}" akan dihapus. Tindakan ini tidak dapat dibatalkan.`
                        : `Pilihan "${pendingDelete?.modifier?.name ?? ""}" akan dihapus. Tindakan ini tidak dapat dibatalkan.`
                }
                onConfirm={confirmDelete}
            />
        </DndContext>
    )
}
