import { useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Spinner } from "~/components/ui/spinner"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"

import { StatusBadge } from "./status-badge"
import {
    useCreateVariant,
    useDeleteVariant,
    useReorderVariants,
    useSetVariantStatus,
    useUpdateVariant,
} from "../services/catalog.mutations"
import { applyServerFieldErrors, catalogErrorMessage } from "../utils/api-error"
import { formatCurrency } from "../utils/format-currency"
import { notifyError, notifySuccess } from "../utils/notify"
import { variantRowSchema, type VariantRowValues } from "../schemas/catalog.schema"
import type { ProductVariant } from "../types/catalog.types"

function VariantFormDialog({
    productId,
    variant,
    open,
    onOpenChange,
}: {
    productId: string
    variant?: ProductVariant
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const [values, setValues] = useState<VariantRowValues>(() => ({
        name: variant?.name ?? "",
        sku: variant?.sku ?? "",
        price: variant?.price ?? 0,
        status: variant?.status ?? "active",
        is_default: variant?.is_default ?? false,
    }))
    const [errors, setErrors] = useState<Partial<Record<keyof VariantRowValues, string>>>({})

    const createMutation = useCreateVariant(productId)
    const updateMutation = useUpdateVariant(productId, variant?.id ?? "")
    const isPending = createMutation.isPending || updateMutation.isPending

    function setField<K extends keyof VariantRowValues>(key: K, value: VariantRowValues[K]) {
        setValues((current) => ({ ...current, [key]: value }))
        setErrors((current) => ({ ...current, [key]: undefined }))
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const parsed = variantRowSchema.safeParse(values)

        if (!parsed.success) {
            const next: Partial<Record<keyof VariantRowValues, string>> = {}

            for (const issue of parsed.error.issues) {
                const key = issue.path[0] as keyof VariantRowValues

                if (next[key] === undefined) {
                    next[key] = issue.message
                }
            }

            setErrors(next)
            return
        }

        const payload = {
            name: parsed.data.name,
            sku: parsed.data.sku === "" ? null : parsed.data.sku,
            price: parsed.data.price,
            is_default: parsed.data.is_default,
        }

        const onSuccess = () => {
            notifySuccess(variant === undefined ? "Variant ditambahkan" : "Variant diperbarui")
            onOpenChange(false)
        }

        const onError = (error: unknown) => {
            const fieldErrors = applyServerFieldErrors(error, ["name", "sku", "price"])

            if (Object.keys(fieldErrors).length > 0) {
                setErrors(fieldErrors)
                return
            }

            notifyError(catalogErrorMessage(error, "Gagal menyimpan variant"))
        }

        if (variant === undefined) {
            createMutation.mutate(payload, { onSuccess, onError })
        } else {
            updateMutation.mutate(payload, { onSuccess, onError })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{variant === undefined ? "Tambah variant" : "Edit variant"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                    <Field>
                        <FieldLabel htmlFor="variant-name">Nama</FieldLabel>
                        <Input
                            id="variant-name"
                            value={values.name}
                            onChange={(event) => setField("name", event.target.value)}
                            aria-invalid={errors.name !== undefined}
                            className="h-11"
                        />
                        {errors.name !== undefined ? <FieldError>{errors.name}</FieldError> : null}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="variant-sku">SKU (opsional)</FieldLabel>
                        <Input
                            id="variant-sku"
                            value={values.sku ?? ""}
                            onChange={(event) => setField("sku", event.target.value)}
                            aria-invalid={errors.sku !== undefined}
                            className="h-11"
                        />
                        {errors.sku !== undefined ? <FieldError>{errors.sku}</FieldError> : null}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="variant-price">Harga (Rp)</FieldLabel>
                        <Input
                            id="variant-price"
                            inputMode="numeric"
                            value={String(values.price)}
                            onChange={(event) => setField("price", Number(event.target.value))}
                            aria-invalid={errors.price !== undefined}
                            className="h-11"
                        />
                        {errors.price !== undefined ? <FieldError>{errors.price}</FieldError> : null}
                    </Field>

                    <div className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5">
                        <div className="flex flex-col">
                            <Text variant="sm" weight="medium">
                                Variant utama
                            </Text>
                            <Text variant="xs" className="text-muted-foreground">
                                Jadikan sebagai pilihan default.
                            </Text>
                        </div>
                        <Switch
                            checked={values.is_default}
                            onCheckedChange={(checked) => setField("is_default", checked === true)}
                        />
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5">
                        <div className="flex flex-col">
                            <Text variant="sm" weight="medium">
                                Status aktif
                            </Text>
                            <Text variant="xs" className="text-muted-foreground">
                                Nonaktifkan untuk menyembunyikan variant.
                            </Text>
                        </div>
                        <Switch
                            checked={values.status === "active"}
                            onCheckedChange={(checked) => setField("status", checked === true ? "active" : "inactive")}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Spinner /> Menyimpan…
                                </>
                            ) : (
                                "Simpan"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function VariantStatusSwitch({ productId, variant }: { productId: string; variant: ProductVariant }) {
    const statusMutation = useSetVariantStatus(productId, variant.id)

    return (
        <Switch
            checked={variant.status === "active"}
            disabled={statusMutation.isPending}
            aria-label={`Status ${variant.name}`}
            onCheckedChange={(checked) =>
                statusMutation.mutate(checked === true ? "active" : "inactive", {
                    onSuccess: () => notifySuccess("Status variant diperbarui"),
                    onError: () => notifyError("Gagal memperbarui status"),
                })
            }
        />
    )
}

export function VariantEditor({ productId, variants }: { productId: string; variants: ProductVariant[] }) {
    const [dialog, setDialog] = useState<{ open: boolean; variant?: ProductVariant }>({ open: false })
    const [pendingDelete, setPendingDelete] = useState<ProductVariant | null>(null)

    const deleteMutation = useDeleteVariant(productId)
    const reorderMutation = useReorderVariants(productId)

    function move(index: number, direction: -1 | 1) {
        const next = [...variants]
        const target = index + direction

        if (target < 0 || target >= next.length) {
            return
        }

        const [item] = next.splice(index, 1)

        next.splice(target, 0, item)

        reorderMutation.mutate(
            next.map((variant, order) => ({ id: variant.id, display_order: order })),
            { onError: () => notifyError("Gagal mengubah urutan") }
        )
    }

    if (variants.length === 0) {
        return (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed p-5">
                <Text variant="sm" className="text-muted-foreground">
                    Belum ada variant. Tambahkan minimal satu variant untuk produk variable.
                </Text>
                <Button type="button" size="sm" onClick={() => setDialog({ open: true })}>
                    <PlusIcon /> Tambah Variant
                </Button>
                <VariantFormDialog
                    productId={productId}
                    open={dialog.open}
                    onOpenChange={(open) => setDialog({ open })}
                />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
                {variants.map((variant, index) => (
                    <div
                        key={variant.id}
                        className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2.5 ring-1 ring-foreground/5"
                    >
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                                <Text variant="sm" weight="medium" truncate>
                                    {variant.name}
                                </Text>
                                {variant.is_default ? (
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                        Default
                                    </span>
                                ) : null}
                                {variant.sku != null && variant.sku !== "" ? (
                                    <Text variant="xs" className="text-muted-foreground">
                                        {variant.sku}
                                    </Text>
                                ) : null}
                            </div>
                            <div className="flex items-center gap-2">
                                <Text variant="sm">{formatCurrency(variant.price)}</Text>
                                <StatusBadge status={variant.status} />
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-0.5">
                            <VariantStatusSwitch productId={productId} variant={variant} />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Naikkan ${variant.name}`}
                                disabled={index === 0 || reorderMutation.isPending}
                                onClick={() => move(index, -1)}
                            >
                                <ArrowUpIcon />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Turunkan ${variant.name}`}
                                disabled={index === variants.length - 1 || reorderMutation.isPending}
                                onClick={() => move(index, 1)}
                            >
                                <ArrowDownIcon />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Ubah ${variant.name}`}
                                onClick={() => setDialog({ open: true, variant })}
                            >
                                <PencilIcon />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Hapus ${variant.name}`}
                                className="text-destructive"
                                onClick={() => setPendingDelete(variant)}
                            >
                                <Trash2Icon />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div>
                <Button type="button" size="sm" variant="outline" onClick={() => setDialog({ open: true })}>
                    <PlusIcon /> Tambah Variant
                </Button>
            </div>

            <VariantFormDialog
                productId={productId}
                variant={dialog.variant}
                open={dialog.open}
                onOpenChange={(open) => setDialog({ open, variant: open ? dialog.variant : undefined })}
            />

            <AlertDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => (!open ? setPendingDelete(null) : undefined)}
            >
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus variant?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Variant &ldquo;{pendingDelete?.name}&rdquo; akan dihapus dari produk ini.
                        </AlertDialogDescription>
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
                                        notifySuccess("Variant dihapus")
                                    },
                                    onError: () => notifyError("Gagal menghapus variant"),
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

export { VariantFormDialog }
