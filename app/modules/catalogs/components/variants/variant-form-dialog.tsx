import { useState } from "react"

import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Spinner } from "~/components/ui/spinner"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"

import { useCreateVariant, useUpdateVariant } from "../../services/variants/variant.mutations"
import { applyServerFieldErrors, catalogErrorMessage } from "../../utils/api-error"
import { issuesToMessages } from "../../utils/issues"
import { notifyError, notifySuccess } from "~/lib/notify"
import { variantRowSchema, type VariantRowValues } from "../../schemas/catalog.schema"
import type { ProductVariant } from "../../types/catalog.types"

export function VariantFormDialog({
    productId,
    variant,
    onClose,
}: {
    productId: string
    variant?: ProductVariant
    onClose: () => void
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
            setErrors(issuesToMessages(parsed.error.issues))
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
            onClose()
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
        <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
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
                        <Button type="button" variant="outline" onClick={onClose}>
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
