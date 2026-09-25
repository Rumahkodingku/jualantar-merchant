import { useState } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"

import { ModifierDraftDialog } from "./modifier-draft-dialog"
import { ModifierGroupDraftCard } from "./modifier-group-draft-card"
import { ModifierGroupDraftDialog } from "./modifier-group-draft-dialog"
import { draftKey } from "./utils"
import type { GroupDraft, GroupDraftPayload, ModifierDraft, ModifierDraftPayload } from "./types"

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

    return (
        <div className="flex flex-col gap-3">
            {groups.length === 0 ? (
                <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed px-4 py-6">
                    <Text variant="sm" className="text-muted-foreground">
                        Customization bersifat opsional. Tambahkan modifier group jika diperlukan.
                    </Text>
                </div>
            ) : (
                groups.map((group) => (
                    <ModifierGroupDraftCard
                        key={group.key}
                        group={group}
                        onEditGroup={() => setGroupDialog({ open: true, group })}
                        onDeleteGroup={() => onChange(groups.filter((item) => item.key !== group.key))}
                        onAddModifier={() => setModifierDialog({ open: true, groupKey: group.key })}
                        onEditModifier={(modifier) => setModifierDialog({ open: true, groupKey: group.key, modifier })}
                        onDeleteModifier={(modifier) => deleteModifier(group.key, modifier)}
                    />
                ))
            )}

            <Button
                type="button"
                size="sm"
                variant={groups.length === 0 ? "default" : "outline"}
                className="self-start"
                onClick={() => setGroupDialog({ open: true })}
            >
                <PlusIcon /> Tambah Modifier Group
            </Button>

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
        </div>
    )
}
