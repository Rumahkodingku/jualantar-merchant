import { useState } from "react"

import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"

import { issuesToMessages } from "../../utils/issues"
import { modifierSchema } from "../../schemas/catalog.schema"
import type { ModifierDraft, ModifierDraftPayload } from "./types"

export function ModifierDraftDialog({
    modifier,
    onClose,
    onSubmit,
}: {
    modifier?: ModifierDraft
    onClose: () => void
    onSubmit: (payload: ModifierDraftPayload) => void
}) {
    const [values, setValues] = useState({
        name: modifier?.name ?? "",
        description: modifier?.description ?? "",
        price: modifier?.price ?? 0,
        is_default: modifier?.is_default ?? false,
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const parsed = modifierSchema.safeParse(values)

        if (!parsed.success) {
            setErrors(issuesToMessages(parsed.error.issues))
            return
        }

        onSubmit({
            name: parsed.data.name,
            description: parsed.data.description ?? "",
            price: parsed.data.price,
            is_default: parsed.data.is_default,
        })
    }

    return (
        <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{modifier === undefined ? "Tambah modifier" : "Edit modifier"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                    <Field>
                        <FieldLabel htmlFor="draft-modifier-name">Nama</FieldLabel>
                        <Input
                            id="draft-modifier-name"
                            value={values.name}
                            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
                            aria-invalid={errors.name !== undefined}
                            className="h-11"
                        />
                        {errors.name !== undefined ? <FieldError>{errors.name}</FieldError> : null}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="draft-modifier-price">Harga tambahan (Rp)</FieldLabel>
                        <Input
                            id="draft-modifier-price"
                            inputMode="numeric"
                            value={String(values.price)}
                            onChange={(event) =>
                                setValues((current) => ({ ...current, price: Number(event.target.value) }))
                            }
                            aria-invalid={errors.price !== undefined}
                            className="h-11"
                        />
                        {errors.price !== undefined ? <FieldError>{errors.price}</FieldError> : null}
                    </Field>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Batal
                        </Button>
                        <Button type="submit">Simpan</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
