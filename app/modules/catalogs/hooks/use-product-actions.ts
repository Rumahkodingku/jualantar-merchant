import { useState } from "react"

import { notifyError, notifySuccess } from "~/lib/notify"

import { useDeleteProduct, useSetProductStatus } from "../services/products/product.mutations"
import { catalogErrorMessage } from "../utils/api-error"
import type { CatalogStatus, Product } from "../types"

export type ProductConfirm = "status" | "delete"

/**
 * Activating, deactivating and deleting a product are the same two requests
 * wherever they are triggered from — the list's overflow menu and the detail
 * header behave identically, down to the wording of the confirmation. This
 * owns that behaviour once and leaves each caller to decide only what happens
 * afterwards: the list simply drops the card, the header returns to the
 * catalogue.
 *
 * The confirmations themselves are rendered by
 * `components/products/product-action-dialogs`, which reads this state.
 */
export function useProductActions(product: Product, options: { onDeleted?: () => void } = {}) {
    const [confirm, setConfirm] = useState<ProductConfirm | null>(null)

    const deleteMutation = useDeleteProduct()
    const statusMutation = useSetProductStatus(product.id)

    const isPending = deleteMutation.isPending || statusMutation.isPending
    const nextStatus: CatalogStatus = product.status === "active" ? "inactive" : "active"

    function runStatus() {
        statusMutation.mutate(nextStatus, {
            onSuccess: () => {
                setConfirm(null)
                notifySuccess(
                    nextStatus === "active" ? "Produk diaktifkan" : "Produk dinonaktifkan",
                    `Status "${product.name}" diperbarui.`
                )
            },
            onError: (error) => notifyError(catalogErrorMessage(error, "Gagal memperbarui status")),
        })
    }

    function runDelete() {
        deleteMutation.mutate(product.id, {
            onSuccess: () => {
                setConfirm(null)
                notifySuccess("Produk dihapus", `"${product.name}" dihapus dari katalog.`)
                options.onDeleted?.()
            },
            onError: (error) => notifyError(catalogErrorMessage(error, "Gagal menghapus produk")),
        })
    }

    function close() {
        setConfirm(null)
    }

    return { confirm, request: setConfirm, close, nextStatus, isPending, runStatus, runDelete }
}
