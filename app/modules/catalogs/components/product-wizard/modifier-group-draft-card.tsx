import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"

import { ModifierDraftRow } from "./modifier-draft-row"
import type { GroupDraft, ModifierDraft } from "./types"

function selectionSummary(group: GroupDraft): string {
    const required = group.is_required ? "Wajib" : "Opsional"
    const selection = group.selection_type === "single" ? "Single" : "Multiple"
    const limit = group.max_selection != null ? `${group.max_selection} pilihan` : `${group.min_selection}+ pilihan`

    return `${required} • ${selection} • ${limit}`
}

export function ModifierGroupDraftCard({
    group,
    onEditGroup,
    onDeleteGroup,
    onAddModifier,
    onEditModifier,
    onDeleteModifier,
}: {
    group: GroupDraft
    onEditGroup: () => void
    onDeleteGroup: () => void
    onAddModifier: () => void
    onEditModifier: (modifier: ModifierDraft) => void
    onDeleteModifier: (modifier: ModifierDraft) => void
}) {
    return (
        <div className="flex flex-col gap-2 rounded-xl border p-3">
            <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col gap-0.5">
                    <Text variant="sm" weight="semibold">
                        {group.name}
                    </Text>
                    <Text variant="xs" className="text-muted-foreground">
                        {selectionSummary(group)}
                    </Text>
                </div>
                <div className="flex shrink-0 gap-0.5">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Ubah ${group.name}`}
                        onClick={onEditGroup}
                    >
                        <PencilIcon />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Hapus ${group.name}`}
                        className="text-destructive"
                        onClick={onDeleteGroup}
                    >
                        <Trash2Icon />
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                {group.modifiers.map((modifier) => (
                    <ModifierDraftRow
                        key={modifier.key}
                        modifier={modifier}
                        onEdit={() => onEditModifier(modifier)}
                        onDelete={() => onDeleteModifier(modifier)}
                    />
                ))}

                <Button type="button" size="sm" variant="ghost" className="self-start" onClick={onAddModifier}>
                    <PlusIcon /> Tambah Modifier
                </Button>
            </div>
        </div>
    )
}
