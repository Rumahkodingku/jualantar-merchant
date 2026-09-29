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

import { ProductActionDialogs } from "../products/product-action-dialogs"
import { StatusBadge } from "../common/status-badge"
import { useProductActions } from "../../hooks/use-product-actions"
import { CATALOGS_PATHS } from "../../utils/paths"
import type { Product } from "../../types"

export function ProductDetailHeader({ product }: { product: Product }) {
    const navigate = useNavigate()
    // Deleting a product from its own page leaves nothing to show, so the
    // merchant goes back to the list rather than staying on a dead record.
    const actions = useProductActions(product, {
        onDeleted: () => void navigate(CATALOGS_PATHS.home),
    })

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
                        <DropdownMenuItem onClick={() => actions.request("status")}>
                            <PowerIcon /> {actions.nextStatus === "active" ? "Aktifkan" : "Nonaktifkan"}
                        </DropdownMenuItem>
                        <DropdownMenuItem variant="destructive" onClick={() => actions.request("delete")}>
                            <Trash2Icon /> Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

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
