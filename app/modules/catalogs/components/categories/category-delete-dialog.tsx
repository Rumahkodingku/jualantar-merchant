import { ConfirmDialog } from "../common/confirm-dialog"
import type { CatalogCategory } from "../../types/catalog.types"

export function CategoryDeleteDialog({
    category,
    isPending,
    onClose,
    onConfirm,
}: {
    category: CatalogCategory | null
    isPending: boolean
    onClose: () => void
    onConfirm: () => void
}) {
    return (
        <ConfirmDialog
            open={category !== null}
            onOpenChange={(open) => (!open ? onClose() : undefined)}
            title="Hapus kategori?"
            description={<>Kategori &ldquo;{category?.name ?? ""}&rdquo; akan dihapus dari katalog.</>}
            confirmLabel="Hapus"
            pendingLabel="Memproses…"
            isPending={isPending}
            onConfirm={onConfirm}
        />
    )
}
