import { EyeIcon, MoreVerticalIcon, PencilIcon, PowerIcon, Trash2Icon } from "lucide-react"
import { useNavigate } from "react-router"
import { Button } from "~/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { ProductActionDialogs } from "./product-action-dialogs"
import { useProductActions } from "../../hooks/use-product-actions"
import { CATALOGS_PATHS } from "../../utils/paths"
import type { Product } from "../../types"

export function ProductActionsMenu({ product }: { product: Product }) {
    const navigate = useNavigate()
    const actions = useProductActions(product)

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
                <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuItem
                        className="cursor-pointer p-2 font-medium"
                        onClick={() => void navigate(CATALOGS_PATHS.detail(product.id))}
                    >
                        <EyeIcon /> Lihat detail Produk
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer p-2 font-medium"
                        onClick={() => void navigate(CATALOGS_PATHS.edit(product.id))}
                    >
                        <PencilIcon /> Edit Produk
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        className="cursor-pointer p-2 font-medium"
                        onClick={() => actions.request("status")}
                    >
                        <PowerIcon /> {actions.nextStatus === "active" ? "Aktifkasn Produk" : "Nonaktifkan Produk"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer p-2 font-medium"
                        variant="destructive"
                        onClick={() => actions.request("delete")}
                    >
                        <Trash2Icon /> Hapus Produk
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ProductActionDialogs
                product={product}
                confirm={actions.confirm}
                isPending={actions.isPending}
                nextStatus={actions.nextStatus}
                onClose={actions.close}
                onConfirmStatus={actions.runStatus}
                onConfirmDelete={actions.runDelete}
            />
        </>
    )
}
