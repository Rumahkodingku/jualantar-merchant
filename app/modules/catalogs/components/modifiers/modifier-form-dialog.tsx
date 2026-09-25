import { useState } from "react"

import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Spinner } from "~/components/ui/spinner"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"

import { useCreateModifier, useUpdateModifier } from "../../services/modifiers/modifier.mutations"
import { applyServerFieldErrors, catalogErrorMessage } from "../../utils/api-error"
import { issuesToMessages } from "../../utils/issues"
import { notifyError, notifySuccess } from "~/lib/notify"
import { modifierSchema, type ModifierFormValues } from "../../schemas/catalog.schema"
import type { ProductModifier } from "../../types/catalog.types"

function modifierDefaults(modifier?: ProductModifier): ModifierFormValues {
    return {
        name: modifier?.name ?? "",
        description: modifier?.description ?? "",
        price: modifier?.price ?? 0,
        is_default: modifier?.is_default ?? false,
    }
}

export function ModifierFormDialog({
    productId,
    groupId,
    modifier,
    onClose,
}: {
    productId: string
    groupId: string
    modifier?: ProductModifier
    onClose: () => void
}) {
    const [values, setValues] = useState<ModifierFormValues>(() => modifierDefaults(modifier))
    const [errors, setErrors] = useState<Record<string, string>>({})

    const createMutation = useCreateModifier(productId, groupId)
    const updateMutation = useUpdateModifier(productId, groupId, modifier?.id ?? "")
    const isPending = createMutation.isPending || updateMutation.isPending

    function setField<K extends keyof ModifierFormValues>(key: K, value: ModifierFormValues[K]) {
        setValues((current) => ({ ...current, [key]: value }))
        setErrors((current) => {
            const next = { ...current }

            delete next[key as string]

            return next
        })
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const parsed = modifierSchema.safeParse(values)

        if (!parsed.success) {
            setErrors(issuesToMessages(parsed.error.issues))
            return
        }

        const payload = {
            name: parsed.data.name,
            description: parsed.data.description,
            price: parsed.data.price,
            is_default: parsed.data.is_default,
        }

        const onSuccess = () => {
            notifySuccess(modifier === undefined ? "Modifier ditambahkan" : "Modifier diperbarui")
            onClose()
        }

        const onError = (error: unknown) => {
            const fieldErrors = applyServerFieldErrors(error, ["name", "description", "price"])

            if (Object.keys(fieldErrors).length > 0) {
                setErrors(fieldErrors)
                return
            }

            notifyError(catalogErrorMessage(error, "Gagal menyimpan modifier"))
        }

        if (modifier === undefined) {
            createMutation.mutate(payload, { onSuccess, onError })
        } else {
            updateMutation.mutate(payload, { onSuccess, onError })
        }
    }

    return (
        <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{modifier === undefined ? "Tambah modifier" : "Edit modifier"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                    <Field>
                        <FieldLabel htmlFor="modifier-name">Nama</FieldLabel>
                        <Input
                            id="modifier-name"
                            value={values.name}
                            onChange={(event) => setField("name", event.target.value)}
                            aria-invalid={errors.name !== undefined}
                            className="h-11"
                        />
                        {errors.name !== undefined ? <FieldError>{errors.name}</FieldError> : null}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="modifier-description">Deskripsi (opsional)</FieldLabel>
                        <Input
                            id="modifier-description"
                            value={values.description ?? ""}
                            onChange={(event) => setField("description", event.target.value)}
                            className="h-11"
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="modifier-price">Harga tambahan (Rp)</FieldLabel>
                        <Input
                            id="modifier-price"
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
                                Dipilih secara default
                            </Text>
                            <Text variant="xs" className="text-muted-foreground">
                                Opsi ini terpilih otomatis oleh pelanggan.
                            </Text>
                        </div>
                        <Switch
                            checked={values.is_default}
                            onCheckedChange={(checked) => setField("is_default", checked === true)}
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
