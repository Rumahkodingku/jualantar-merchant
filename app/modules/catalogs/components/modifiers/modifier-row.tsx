import { ArrowDownIcon, ArrowUpIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"

import { StatusBadge } from "../status-badge"
import { EntityStatusSwitch } from "../common/entity-status-switch"
import { useSetModifierStatus } from "../../services/modifiers/modifier.mutations"
import { formatCurrency } from "../../utils/format-currency"
import type { ProductModifier } from "../../types/catalog.types"

export function ModifierRow({
    productId,
    groupId,
    modifier,
    isFirst,
    isLast,
    onMove,
    onEdit,
    onDelete,
}: {
    productId: string
    groupId: string
    modifier: ProductModifier
    isFirst: boolean
    isLast: boolean
    onMove: (direction: -1 | 1) => void
    onEdit: () => void
    onDelete: () => void
}) {
    const statusMutation = useSetModifierStatus(productId, groupId, modifier.id)

    return (
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center gap-2">
                    <Text variant="sm" truncate>
                        {modifier.name}
                    </Text>
                    {modifier.is_default ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            Default
                        </span>
                    ) : null}
                </div>
                <Text variant="xs" className="text-muted-foreground">
                    + {formatCurrency(modifier.price)}
                </Text>
            </div>

            <StatusBadge status={modifier.status} />

            <div className="flex shrink-0 items-center gap-0.5">
                <EntityStatusSwitch
                    checked={modifier.status === "active"}
                    disabled={statusMutation.isPending}
                    ariaLabel={`Status ${modifier.name}`}
                    successMessage="Status modifier diperbarui"
                    setStatus={statusMutation.mutate}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Naikkan ${modifier.name}`}
                    disabled={isFirst}
                    onClick={() => onMove(-1)}
                >
                    <ArrowUpIcon />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Turunkan ${modifier.name}`}
                    disabled={isLast}
                    onClick={() => onMove(1)}
                >
                    <ArrowDownIcon />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Ubah ${modifier.name}`}
                    onClick={onEdit}
                >
                    <PencilIcon />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Hapus ${modifier.name}`}
                    className="text-destructive"
                    onClick={onDelete}
                >
                    <Trash2Icon />
                </Button>
            </div>
        </div>
    )
}
