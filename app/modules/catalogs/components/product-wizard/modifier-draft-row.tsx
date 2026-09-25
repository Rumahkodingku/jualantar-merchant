import { PencilIcon, Trash2Icon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"

import { formatCurrency } from "../../utils/format-currency"
import type { ModifierDraft } from "./types"

export function ModifierDraftRow({
    modifier,
    onEdit,
    onDelete,
}: {
    modifier: ModifierDraft
    onEdit: () => void
    onDelete: () => void
}) {
    return (
        <div className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
            <div className="flex min-w-0 flex-col">
                <Text variant="sm" truncate>
                    {modifier.name}
                </Text>
                <Text variant="xs" className="text-muted-foreground">
                    + {formatCurrency(modifier.price)}
                </Text>
            </div>
            <div className="flex shrink-0 gap-0.5">
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
