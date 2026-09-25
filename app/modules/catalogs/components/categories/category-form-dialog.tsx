import { useState } from "react"

import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Spinner } from "~/components/ui/spinner"
import { Textarea } from "~/components/ui/textarea"

import { useCreateCategory, useUpdateCategory } from "../../services/categories/category.mutations"
import { applyServerFieldErrors, catalogErrorMessage } from "../../utils/api-error"
import { issuesToMessages } from "../../utils/issues"
import { notifyError, notifySuccess } from "~/lib/notify"
import { categorySchema, type CategoryFormValues } from "../../schemas/catalog.schema"
import type { CatalogCategory } from "../../types/catalog.types"

export function CategoryFormDialog({ category, onClose }: { category?: CatalogCategory; onClose: () => void }) {
    const createMutation = useCreateCategory()
    const updateMutation = useUpdateCategory(category?.id ?? "")
    const [values, setValues] = useState<CategoryFormValues>({
        name: category?.name ?? "",
        description: category?.description ?? "",
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const isPending = createMutation.isPending || updateMutation.isPending

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const parsed = categorySchema.safeParse(values)

        if (!parsed.success) {
            setErrors(issuesToMessages(parsed.error.issues))
            return
        }

        setErrors({})

        const onSuccess = () => {
            notifySuccess(category === undefined ? "Kategori dibuat" : "Kategori diperbarui")
            onClose()
        }

        const payload = { name: parsed.data.name, description: parsed.data.description ?? null }

        const onError = (error: unknown) => {
            const fieldErrors = applyServerFieldErrors(error, ["name", "description"])

            if (Object.keys(fieldErrors).length > 0) {
                setErrors(fieldErrors)
                return
            }

            notifyError(catalogErrorMessage(error, "Gagal menyimpan kategori"))
        }

        if (category === undefined) {
            createMutation.mutate(payload, { onSuccess, onError })
        } else {
            updateMutation.mutate(payload, { onSuccess, onError })
        }
    }

    return (
        <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{category === undefined ? "Tambah kategori" : "Edit kategori"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                    <Field>
                        <FieldLabel htmlFor="category-name">Nama kategori</FieldLabel>
                        <Input
                            id="category-name"
                            value={values.name}
                            onChange={(event) => {
                                setValues((current) => ({ ...current, name: event.target.value }))
                                setErrors({})
                            }}
                            placeholder="cth. Makanan"
                            aria-invalid={errors.name !== undefined}
                            className="h-11"
                        />
                        {errors.name !== undefined ? <FieldError>{errors.name}</FieldError> : null}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="category-description">Deskripsi (opsional)</FieldLabel>
                        <Textarea
                            id="category-description"
                            value={values.description ?? ""}
                            onChange={(event) =>
                                setValues((current) => ({ ...current, description: event.target.value }))
                            }
                            rows={3}
                        />
                    </Field>

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
