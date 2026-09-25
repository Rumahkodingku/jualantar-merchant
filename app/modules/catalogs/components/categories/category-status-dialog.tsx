import { ConfirmDialog } from "../common/confirm-dialog"
import type { CatalogCategory } from "../../types/catalog.types"

export function CategoryStatusDialog({
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
    const deactivating = category?.status === "active"

    return (
        <ConfirmDialog
            open={category !== null}
            onOpenChange={(open) => (!open ? onClose() : undefined)}
            title={deactivating ? "Nonaktifkan kategori?" : "Aktifkan kategori?"}
            description={
                deactivating
                    ? `Kategori "${category?.name ?? ""}" tidak akan aktif pada katalog.`
                    : `Kategori "${category?.name ?? ""}" akan tampil aktif pada katalog.`
            }
            confirmLabel={deactivating ? "Nonaktifkan" : "Aktifkan"}
            pendingLabel="Memproses…"
            variant={deactivating ? "destructive" : "default"}
            isPending={isPending}
            onConfirm={onConfirm}
        />
    )
}
