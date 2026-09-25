import { ArrowDownIcon, ArrowUpIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"

import { EntityStatusSwitch } from "../common/entity-status-switch"
import { StatusBadge } from "../status-badge"
import { useSetVariantStatus } from "../../services/variants/variant.mutations"
import { formatCurrency } from "../../utils/format-currency"
import type { ProductVariant } from "../../types/catalog.types"

export function VariantRow({
    productId,
    variant,
    isFirst,
    isLast,
    isReordering,
    onMove,
    onEdit,
    onDelete,
}: {
    productId: string
    variant: ProductVariant
    isFirst: boolean
    isLast: boolean
    isReordering: boolean
    onMove: (direction: -1 | 1) => void
    onEdit: () => void
    onDelete: () => void
}) {
    const statusMutation = useSetVariantStatus(productId, variant.id)

    return (
        <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2.5 ring-1 ring-foreground/5">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-center gap-2">
                    <Text variant="sm" weight="medium" truncate>
                        {variant.name}
                    </Text>
                    {variant.is_default ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            Default
                        </span>
                    ) : null}
                    {variant.sku != null && variant.sku !== "" ? (
                        <Text variant="xs" className="text-muted-foreground">
                            {variant.sku}
                        </Text>
                    ) : null}
                </div>
                <div className="flex items-center gap-2">
                    <Text variant="sm">{formatCurrency(variant.price)}</Text>
                    <StatusBadge status={variant.status} />
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-0.5">
                <EntityStatusSwitch
                    checked={variant.status === "active"}
                    disabled={statusMutation.isPending}
                    ariaLabel={`Status ${variant.name}`}
                    successMessage="Status variant diperbarui"
                    setStatus={statusMutation.mutate}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Naikkan ${variant.name}`}
                    disabled={isFirst || isReordering}
                    onClick={() => onMove(-1)}
                >
                    <ArrowUpIcon />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Turunkan ${variant.name}`}
                    disabled={isLast || isReordering}
                    onClick={() => onMove(1)}
                >
                    <ArrowDownIcon />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Ubah ${variant.name}`}
                    onClick={onEdit}
                >
                    <PencilIcon />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Hapus ${variant.name}`}
                    className="text-destructive"
                    onClick={onDelete}
                >
                    <Trash2Icon />
                </Button>
            </div>
        </div>
    )
}
