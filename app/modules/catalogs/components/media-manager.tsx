import { useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, StarIcon, Trash2Icon } from "lucide-react"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"
import { MAX_UPLOAD_SIZE_LABEL } from "~/modules/merchant-registration"

import { MediaUploadTile } from "./media-upload-tile"
import { MAX_PRODUCT_MEDIA } from "../hooks/use-catalog-media-upload"
import { useDeleteMedia, useReorderMedia, useSetPrimaryMedia } from "../services/catalog.mutations"
import { catalogErrorMessage } from "../utils/api-error"
import { notifyError, notifySuccess } from "../utils/notify"
import type { ProductMedia } from "../types/catalog.types"

export function MediaManager({ productId, media }: { productId: string; media: ProductMedia[] }) {
    const [pendingDelete, setPendingDelete] = useState<ProductMedia | null>(null)

    const deleteMutation = useDeleteMedia(productId)
    const primaryMutation = useSetPrimaryMedia(productId)
    const reorderMutation = useReorderMedia(productId)

    function move(index: number, direction: -1 | 1) {
        const next = [...media]
        const target = index + direction

        if (target < 0 || target >= next.length) {
            return
        }

        const [item] = next.splice(index, 1)

        next.splice(target, 0, item)

        reorderMutation.mutate(
            next.map((entry, order) => ({ id: entry.id, display_order: order })),
            { onError: (error) => notifyError(catalogErrorMessage(error, "Gagal mengubah urutan")) }
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {media.map((item, index) => (
                    <div key={item.id} className="group/media relative flex flex-col gap-1.5">
                        <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
                            {item.url != null ? (
                                <img
                                    src={item.url}
                                    alt={item.alt_text ?? ""}
                                    loading="lazy"
                                    className="size-full object-cover"
                                />
                            ) : null}

                            {item.is_primary ? (
                                <span className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                                    <StarIcon aria-hidden="true" className="size-3" /> Utama
                                </span>
                            ) : null}

                            <div className="absolute inset-x-1 bottom-1 flex justify-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover/media:opacity-100 sm:focus-within:opacity-100">
                                <Button
                                    type="button"
                                    size="icon-xs"
                                    variant="secondary"
                                    aria-label={`Foto utama ${item.alt_text ?? index + 1}`}
                                    disabled={item.is_primary || primaryMutation.isPending}
                                    onClick={() =>
                                        primaryMutation.mutate(item.id, {
                                            onSuccess: () => notifySuccess("Foto utama diperbarui"),
                                            onError: (error) =>
                                                notifyError(catalogErrorMessage(error, "Gagal mengatur foto utama")),
                                        })
                                    }
                                >
                                    <StarIcon />
                                </Button>
                                <Button
                                    type="button"
                                    size="icon-xs"
                                    variant="secondary"
                                    aria-label={`Naikkan foto ${index + 1}`}
                                    disabled={index === 0 || reorderMutation.isPending}
                                    onClick={() => move(index, -1)}
                                >
                                    <ArrowUpIcon />
                                </Button>
                                <Button
                                    type="button"
                                    size="icon-xs"
                                    variant="secondary"
                                    aria-label={`Turunkan foto ${index + 1}`}
                                    disabled={index === media.length - 1 || reorderMutation.isPending}
                                    onClick={() => move(index, 1)}
                                >
                                    <ArrowDownIcon />
                                </Button>
                                <Button
                                    type="button"
                                    size="icon-xs"
                                    variant="destructive"
                                    aria-label={`Hapus foto ${index + 1}`}
                                    onClick={() => setPendingDelete(item)}
                                >
                                    <Trash2Icon />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                <MediaUploadTile productId={productId} mediaCount={media.length} />
            </div>

            <Text variant="xs" className="text-muted-foreground">
                Format JPG, PNG, atau WEBP. Maksimal {MAX_UPLOAD_SIZE_LABEL} per foto dan {MAX_PRODUCT_MEDIA} foto per
                produk.
            </Text>

            <AlertDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => (!open ? setPendingDelete(null) : undefined)}
            >
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus foto?</AlertDialogTitle>
                        <AlertDialogDescription>Foto produk ini akan dihapus dari daftar media.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={deleteMutation.isPending}
                            onClick={() => {
                                if (pendingDelete === null) {
                                    return
                                }

                                deleteMutation.mutate(pendingDelete.id, {
                                    onSuccess: () => {
                                        setPendingDelete(null)
                                        notifySuccess("Foto dihapus")
                                    },
                                    onError: (error) => notifyError(catalogErrorMessage(error, "Gagal menghapus foto")),
                                })
                            }}
                        >
                            {deleteMutation.isPending ? (
                                <>
                                    <Spinner /> Menghapus…
                                </>
                            ) : (
                                "Hapus"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
