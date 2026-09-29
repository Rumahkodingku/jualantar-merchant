import { ConfirmDialog } from "../common/confirm-dialog"
import type { ProductConfirm } from "../../hooks/use-product-actions"
import type { Product } from "../../types"

/**
 * The two confirmations a product's status change and deletion share, wherever
 * the action was triggered from. Render them next to whichever menu asked for
 * them and feed the state from `useProductActions`.
 */
export function ProductActionDialogs({
    product,
    confirm,
    isPending,
    nextStatus,
    onClose,
    onConfirmStatus,
    onConfirmDelete,
}: {
    product: Product
    confirm: ProductConfirm | null
    isPending: boolean
    nextStatus: "active" | "inactive"
    onClose: () => void
    onConfirmStatus: () => void
    onConfirmDelete: () => void
}) {
    return (
        <>
            <ConfirmDialog
                open={confirm === "status"}
                onOpenChange={(open) => (!open ? onClose() : undefined)}
                title={nextStatus === "active" ? "Aktifkan produk?" : "Nonaktifkan produk?"}
                description={
                    nextStatus === "active"
                        ? `Produk "${product.name}" akan tampil aktif pada master catalog.`
                        : `Produk "${product.name}" tidak akan aktif pada master catalog.`
                }
                confirmLabel={nextStatus === "active" ? "Aktifkan" : "Nonaktifkan"}
                pendingLabel="Memproses…"
                variant={nextStatus === "active" ? "default" : "destructive"}
                isPending={isPending}
                onConfirm={onConfirmStatus}
            />

            <ConfirmDialog
                open={confirm === "delete"}
                onOpenChange={(open) => (!open ? onClose() : undefined)}
                title="Hapus produk?"
                description={<>Produk &ldquo;{product.name}&rdquo; akan dihapus dari katalog.</>}
                confirmLabel="Hapus"
                pendingLabel="Menghapus…"
                isPending={isPending}
                onConfirm={onConfirmDelete}
            />
        </>
    )
}
