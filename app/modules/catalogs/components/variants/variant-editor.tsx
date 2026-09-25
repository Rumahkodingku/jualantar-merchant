import { useState } from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"

import { ConfirmDialog } from "../common/confirm-dialog"
import { VariantFormDialog } from "./variant-form-dialog"
import { VariantRow } from "./variant-row"
import { useDeleteVariant, useReorderVariants } from "../../services/variants/variant.mutations"
import { useEntityReorder } from "../../hooks/use-entity-reorder"
import { notifyError, notifySuccess } from "~/lib/notify"
import type { ProductVariant } from "../../types/catalog.types"

export function VariantEditor({ productId, variants }: { productId: string; variants: ProductVariant[] }) {
    const [dialog, setDialog] = useState<{ open: boolean; variant?: ProductVariant }>({ open: false })
    const [pendingDelete, setPendingDelete] = useState<ProductVariant | null>(null)

    const deleteMutation = useDeleteVariant(productId)
    const reorderMutation = useReorderVariants(productId)

    const { move } = useEntityReorder({ items: variants, reorder: reorderMutation.mutate })

    return (
        <div className="flex flex-col gap-3">
            {variants.length === 0 ? (
                <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed p-5">
                    <Text variant="sm" className="text-muted-foreground">
                        Belum ada variant. Tambahkan minimal satu variant untuk produk variable.
                    </Text>
                    <Button type="button" size="sm" onClick={() => setDialog({ open: true })}>
                        <PlusIcon /> Tambah Variant
                    </Button>
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-2">
                        {variants.map((variant, index) => (
                            <VariantRow
                                key={variant.id}
                                productId={productId}
                                variant={variant}
                                isFirst={index === 0}
                                isLast={index === variants.length - 1}
                                isReordering={reorderMutation.isPending}
                                onMove={(direction) => move(index, direction)}
                                onEdit={() => setDialog({ open: true, variant })}
                                onDelete={() => setPendingDelete(variant)}
                            />
                        ))}
                    </div>

                    <div>
                        <Button type="button" size="sm" variant="outline" onClick={() => setDialog({ open: true })}>
                            <PlusIcon /> Tambah Variant
                        </Button>
                    </div>
                </>
            )}

            {dialog.open ? (
                <VariantFormDialog
                    productId={productId}
                    variant={dialog.variant}
                    onClose={() => setDialog({ open: false })}
                />
            ) : null}

            <ConfirmDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => (!open ? setPendingDelete(null) : undefined)}
                title="Hapus variant?"
                description={<>Variant &ldquo;{pendingDelete?.name}&rdquo; akan dihapus dari produk ini.</>}
                isPending={deleteMutation.isPending}
                onConfirm={() => {
                    if (pendingDelete === null) {
                        return
                    }

                    deleteMutation.mutate(pendingDelete.id, {
                        onSuccess: () => {
                            setPendingDelete(null)
                            notifySuccess("Variant dihapus")
                        },
                        onError: () => notifyError("Gagal menghapus variant"),
                    })
                }}
            />
        </div>
    )
}
