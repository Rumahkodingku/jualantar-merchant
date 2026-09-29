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
                    <DropdownMenuItem onClick={() => actions.request("status")}>
                        <PowerIcon /> {actions.nextStatus === "active" ? "Nonaktifkan" : "Aktifkan"}
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onClick={() => actions.request("delete")}>
                        <Trash2Icon /> Hapus
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
