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

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Spinner } from "~/components/ui/spinner"

import { useDeleteProduct, useSetProductStatus } from "../services/catalog.mutations"
import { CATALOGS_PATHS } from "../utils/paths"
import { notifyError, notifySuccess } from "../utils/notify"
import type { Product } from "../types/catalog.types"

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
            onError: () => notifyError("Gagal memperbarui status"),
        })
    }

    function runDelete() {
        deleteMutation.mutate(product.id, {
            onSuccess: () => {
                setConfirm(null)
                notifySuccess("Produk dihapus", `"${product.name}" dihapus dari katalog.`)
            },
            onError: () => notifyError("Gagal menghapus produk"),
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

            <AlertDialog open={confirm === "status"} onOpenChange={(open) => (!open ? setConfirm(null) : undefined)}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {nextStatus === "active" ? "Aktifkan produk?" : "Nonaktifkan produk?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {nextStatus === "active"
                                ? `Produk "${product.name}" akan tampil aktif pada master catalog.`
                                : `Produk "${product.name}" tidak akan aktif pada master catalog.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <Button
                            type="button"
                            variant={nextStatus === "active" ? "default" : "destructive"}
                            disabled={isPending}
                            onClick={runStatus}
                        >
                            {isPending ? (
                                <>
                                    <Spinner /> Memproses…
                                </>
                            ) : nextStatus === "active" ? (
                                "Aktifkan"
                            ) : (
                                "Nonaktifkan"
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={confirm === "delete"} onOpenChange={(open) => (!open ? setConfirm(null) : undefined)}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus produk?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Produk &ldquo;{product.name}&rdquo; akan dihapus dari katalog.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <Button type="button" variant="destructive" disabled={isPending} onClick={runDelete}>
                            {isPending ? (
                                <>
                                    <Spinner /> Memproses…
                                </>
                            ) : (
                                "Hapus"
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
