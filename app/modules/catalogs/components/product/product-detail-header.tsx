import { useState } from "react"
import { ChevronLeftIcon, MoreVerticalIcon, PencilIcon, PowerIcon, Trash2Icon } from "lucide-react"
import { useNavigate } from "react-router"

import { Button } from "~/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Text } from "~/components/ui/text"
import { notifyError, notifySuccess } from "~/lib/notify"

import { ConfirmDialog } from "../common/confirm-dialog"
import { StatusBadge } from "../common/status-badge"
import { useDeleteProduct, useSetProductStatus } from "../../services/products/product.mutations"
import { catalogErrorMessage } from "../../utils/api-error"
import { CATALOGS_PATHS } from "../../utils/paths"
import type { Product } from "../../types/catalog.types"

type ConfirmAction = "status" | "delete"

export function ProductDetailHeader({ product }: { product: Product }) {
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
                void navigate(CATALOGS_PATHS.home)
            },
            onError: (error) => notifyError(catalogErrorMessage(error, "Gagal menghapus produk")),
        })
    }

    return (
        <>
            <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Kembali"
                    className="-ml-2 size-10 shrink-0 justify-self-start"
                    onClick={() => void navigate(CATALOGS_PATHS.home)}
                >
                    <ChevronLeftIcon />
                </Button>

                <div className="flex min-w-0 flex-col items-center gap-1">
                    <Text as="h1" variant="base" weight="semibold" className="max-w-full tracking-tight" truncate>
                        {product.name}
                    </Text>
                    <StatusBadge status={product.status} />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Aksi untuk ${product.name}`}
                                className="justify-self-end"
                            />
                        }
                    >
                        <MoreVerticalIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => void navigate(CATALOGS_PATHS.edit(product.id))}>
                            <PencilIcon /> Edit produk
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setConfirm("status")}>
                            <PowerIcon /> {nextStatus === "active" ? "Aktifkan" : "Nonaktifkan"}
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => setConfirm("delete")}>
                            <Trash2Icon /> Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

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
                pendingLabel="Menghapus…"
                isPending={isPending}
                onConfirm={runDelete}
            />
        </>
    )
}
