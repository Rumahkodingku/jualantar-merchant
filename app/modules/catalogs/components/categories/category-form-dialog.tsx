import { useState } from "react"

import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Textarea } from "~/components/ui/textarea"

import { FormDialog } from "../common/form-dialog"
import { NameField } from "../common/form-fields"
import { useFieldErrors } from "../common/use-field-errors"
import { useCreateCategory, useUpdateCategory } from "../../services/categories/category.mutations"
import { applyServerFieldErrors, catalogErrorMessage } from "../../utils/api-error"
import { issuesToMessages } from "../../utils/issues"
import { notifyError, notifySuccess } from "~/lib/notify"
import { categorySchema, type CategoryFormValues } from "../../schemas/"
import type { CatalogCategory } from "../../types"

export function CategoryFormDialog({ category, onClose }: { category?: CatalogCategory; onClose: () => void }) {
    const createMutation = useCreateCategory()
    const updateMutation = useUpdateCategory(category?.id ?? "")
    const [values, setValues] = useState<CategoryFormValues>({
        name: category?.name ?? "",
        description: category?.description ?? "",
    })
    const { errors, setErrors, clear, reset } = useFieldErrors()

    const isPending = createMutation.isPending || updateMutation.isPending

    function handleSubmit() {
        const parsed = categorySchema.safeParse(values)

        if (!parsed.success) {
            setErrors(issuesToMessages(parsed.error.issues))
            return
        }

        reset()

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
        <FormDialog
            title={category === undefined ? "Tambah kategori" : "Edit kategori"}
            description="Kelompokkan produk agar mudah dicari merchant."
            isPending={isPending}
            onClose={onClose}
            onSubmit={handleSubmit}
        >
            <NameField
                id="category-name"
                label="Nama kategori"
                value={values.name}
                error={errors.name}
                placeholder="cth. Makanan"
                onChange={(name) => {
                    setValues((current) => ({ ...current, name }))
                    clear("name")
                }}
            />

            <Field>
                <FieldLabel htmlFor="category-description">Deskripsi (opsional)</FieldLabel>
                <Textarea
                    id="category-description"
                    value={values.description ?? ""}
                    onChange={(event) => {
                        setValues((current) => ({ ...current, description: event.target.value }))
                        clear("description")
                    }}
                    rows={3}
                    aria-invalid={errors.description !== undefined}
                />
                {errors.description !== undefined ? <FieldError>{errors.description}</FieldError> : null}
            </Field>
        </FormDialog>
    )
}
