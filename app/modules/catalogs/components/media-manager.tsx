import { useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, StarIcon, Trash2Icon } from "lucide-react"

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

import { useAddMedia, useDeleteMedia, useReorderMedia, useSetPrimaryMedia } from "../services/catalog.mutations"
import { pickMediaPlaceholder } from "../services/catalog-mock.repository"
import { notifyError, notifySuccess } from "../utils/notify"
import type { ProductMedia } from "../types/catalog.types"

export function MediaManager({ productId, media }: { productId: string; media: ProductMedia[] }) {
    const [pendingDelete, setPendingDelete] = useState<ProductMedia | null>(null)

    const addMutation = useAddMedia(productId)
    const deleteMutation = useDeleteMedia(productId)
    const primaryMutation = useSetPrimaryMedia(productId)
    const reorderMutation = useReorderMedia(productId)

    function handleAdd() {
        const placeholder = pickMediaPlaceholder()

        addMutation.mutate(
            {
                url: placeholder.url ?? "/images/catalog/placeholder-1.svg",
                alt_text: placeholder.alt_text,
                mime_type: placeholder.mime_type,
                file_size: placeholder.file_size,
            },
            {
                onSuccess: () => notifySuccess("Foto ditambahkan"),
                onError: () => notifyError("Gagal menambahkan foto"),
            }
        )
    }

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
            { onError: () => notifyError("Gagal mengubah urutan") }
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
                                            onError: () => notifyError("Gagal mengatur foto utama"),
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

                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={addMutation.isPending}
                    aria-label="Tambah foto"
                    className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                    {addMutation.isPending ? <Spinner /> : <PlusIcon aria-hidden="true" className="size-5" />}
                    <Text variant="xs">Tambah</Text>
                </button>
            </div>

            <Text variant="xs" className="text-muted-foreground">
                Mode dummy: memilih foto menambahkan gambar placeholder lokal, tanpa upload ke storage.
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
                                    onError: () => notifyError("Gagal menghapus foto"),
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
