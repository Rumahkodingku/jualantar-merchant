import { useState } from "react"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"

import { ConfirmDialog } from "../common/confirm-dialog"
import { EntityStatusSwitch } from "../common/entity-status-switch"
import { StatusBadge } from "../status-badge"
import { ModifierFormDialog } from "./modifier-form-dialog"
import { ModifierRow } from "./modifier-row"
import {
    useDeleteModifier,
    useDeleteModifierGroup,
    useReorderModifiers,
    useSetModifierGroupStatus,
} from "../../services/modifiers/modifier.mutations"
import { useEntityReorder } from "../../hooks/use-entity-reorder"
import { notifyError, notifySuccess } from "~/lib/notify"
import { SELECTION_TYPE_LABEL } from "../../utils/labels"
import type { ProductModifier, ProductModifierGroup } from "../../types/catalog.types"

export function ModifierGroupCard({
    productId,
    group,
    onEditGroup,
}: {
    productId: string
    group: ProductModifierGroup
    onEditGroup: (group: ProductModifierGroup) => void
}) {
    const [modifierDialog, setModifierDialog] = useState<{ open: boolean; modifier?: ProductModifier }>({
        open: false,
    })
    const [pendingDeleteModifier, setPendingDeleteModifier] = useState<ProductModifier | null>(null)
    const [pendingDeleteGroup, setPendingDeleteGroup] = useState(false)

    const statusMutation = useSetModifierGroupStatus(productId, group.id)
    const deleteGroupMutation = useDeleteModifierGroup(productId)
    const deleteModifierMutation = useDeleteModifier(productId, group.id)
    const reorderModifiers = useReorderModifiers(productId, group.id)

    const { move } = useEntityReorder({ items: group.modifiers, reorder: reorderModifiers.mutate })

    const selectionLabel = [
        group.is_required ? "Wajib" : "Opsional",
        SELECTION_TYPE_LABEL[group.selection_type],
        group.max_selection != null ? `${group.max_selection} pilihan` : `${group.min_selection}+ pilihan`,
    ].join(" • ")

    return (
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 ring-1 ring-foreground/5">
            <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <Text variant="sm" weight="semibold">
                            {group.name}
                        </Text>
                        <StatusBadge status={group.status} />
                    </div>
                    <Text variant="xs" className="text-muted-foreground">
                        {selectionLabel}
                    </Text>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    <EntityStatusSwitch
                        checked={group.status === "active"}
                        disabled={statusMutation.isPending}
                        ariaLabel={`Status group ${group.name}`}
                        successMessage="Status group diperbarui"
                        setStatus={statusMutation.mutate}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Ubah group ${group.name}`}
                        onClick={() => onEditGroup(group)}
                    >
                        <PencilIcon />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Hapus group ${group.name}`}
                        className="text-destructive"
                        onClick={() => setPendingDeleteGroup(true)}
                    >
                        <Trash2Icon />
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                {group.modifiers.map((modifier, index) => (
                    <ModifierRow
                        key={modifier.id}
                        productId={productId}
                        groupId={group.id}
                        modifier={modifier}
                        isFirst={index === 0}
                        isLast={index === group.modifiers.length - 1}
                        onMove={(direction) => move(index, direction)}
                        onEdit={() => setModifierDialog({ open: true, modifier })}
                        onDelete={() => setPendingDeleteModifier(modifier)}
                    />
                ))}

                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="self-start"
                    onClick={() => setModifierDialog({ open: true })}
                >
                    <PlusIcon /> Tambah Modifier
                </Button>
            </div>

            {modifierDialog.open ? (
                <ModifierFormDialog
                    productId={productId}
                    groupId={group.id}
                    modifier={modifierDialog.modifier}
                    onClose={() => setModifierDialog({ open: false })}
                />
            ) : null}

            <ConfirmDialog
                open={pendingDeleteModifier !== null}
                onOpenChange={(open) => (!open ? setPendingDeleteModifier(null) : undefined)}
                title="Hapus modifier?"
                description={<>Modifier &ldquo;{pendingDeleteModifier?.name}&rdquo; akan dihapus dari group ini.</>}
                isPending={deleteModifierMutation.isPending}
                onConfirm={() => {
                    if (pendingDeleteModifier === null) {
                        return
                    }

                    deleteModifierMutation.mutate(pendingDeleteModifier.id, {
                        onSuccess: () => {
                            setPendingDeleteModifier(null)
                            notifySuccess("Modifier dihapus")
                        },
                        onError: () => notifyError("Gagal menghapus modifier"),
                    })
                }}
            />

            <ConfirmDialog
                open={pendingDeleteGroup}
                onOpenChange={(open) => (!open ? setPendingDeleteGroup(false) : undefined)}
                title="Hapus modifier group?"
                description={<>Group &ldquo;{group.name}&rdquo; beserta seluruh modifier di dalamnya akan dihapus.</>}
                isPending={deleteGroupMutation.isPending}
                onConfirm={() =>
                    deleteGroupMutation.mutate(group.id, {
                        onSuccess: () => {
                            setPendingDeleteGroup(false)
                            notifySuccess("Group dihapus")
                        },
                        onError: () => notifyError("Gagal menghapus group"),
                    })
                }
            />
        </div>
    )
}
