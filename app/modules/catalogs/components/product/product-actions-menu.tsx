import { useState } from "react"
import {
    EyeIcon,
    ImagesIcon,
    MoreVerticalIcon,
    PencilIcon,
    PowerIcon,
    SlidersHorizontalIcon,
    StoreIcon,
    Trash2Icon,
    UtensilsCrossedIcon,
} from "lucide-react"
import { useNavigate } from "react-router"

import { Button } from "~/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

import { ConfirmDialog } from "../common/confirm-dialog"
import { useDeleteProduct, useSetProductStatus } from "../../services/products/product.mutations"
import { CATALOGS_PATHS } from "../../utils/paths"
import { catalogErrorMessage } from "../../utils/api-error"
import { notifyError, notifySuccess } from "~/lib/notify"
import type { Product } from "../../types/catalog.types"

type ConfirmAction = "status" | "delete"

export function ProductActionsMenu({ product }: { product: Product }) {
    const navigate = useNavigate()
    const [confirm, setConfirm] = useState<ConfirmAction | null>(null)

    const deleteMutation = useDeleteProduct()
    const statusMutation = useSetProductStatus(product.id)

    const isPending = deleteMutation.isPending || statusMutation.isPending
    const nextStatus = product.status === "active" ? "inactive" : "active"

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
            },
            onError: (error) => notifyError(catalogErrorMessage(error, "Gagal menghapus produk")),
        })
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Aksi untuk ${product.name}`}
                        />
                    }
                >
                    <MoreVerticalIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => void navigate(CATALOGS_PATHS.detail(product.id))}>
                        <EyeIcon /> Lihat detail
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => void navigate(CATALOGS_PATHS.edit(product.id))}>
                        <PencilIcon /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => void navigate(`${CATALOGS_PATHS.detail(product.id)}?tab=variant`)}>
                        <SlidersHorizontalIcon /> Kelola variant
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => void navigate(`${CATALOGS_PATHS.detail(product.id)}?tab=customization`)}
                    >
                        <UtensilsCrossedIcon /> Kelola customization
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => void navigate(`${CATALOGS_PATHS.detail(product.id)}?tab=media`)}>
                        <ImagesIcon /> Kelola media
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => void navigate(`${CATALOGS_PATHS.detail(product.id)}?tab=outlet`)}>
                        <StoreIcon /> Kelola outlet
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setConfirm("status")}>
                        <PowerIcon /> {product.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => setConfirm("delete")}>
                        <Trash2Icon /> Hapus
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ConfirmDialog
                open={confirm === "status"}
                onOpenChange={(open) => (!open ? setConfirm(null) : undefined)}
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
                onConfirm={runStatus}
            />

            <ConfirmDialog
                open={confirm === "delete"}
                onOpenChange={(open) => (!open ? setConfirm(null) : undefined)}
                title="Hapus produk?"
                description={<>Produk &ldquo;{product.name}&rdquo; akan dihapus dari katalog.</>}
                confirmLabel="Hapus"
                pendingLabel="Memproses…"
                isPending={isPending}
                onConfirm={runDelete}
            />
        </>
    )
}
