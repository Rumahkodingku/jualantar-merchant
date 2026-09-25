import { useState } from "react"

import { Button } from "~/components/ui/button"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"
import { Textarea } from "~/components/ui/textarea"

import { DetailRows } from "./detail-rows"
import { useUpdateProduct } from "../../services/products/product.mutations"
import { applyServerFieldErrors, catalogErrorMessage } from "../../utils/api-error"
import { issuesToMessages } from "../../utils/issues"
import { notifyError, notifySuccess } from "~/lib/notify"
import { PRODUCT_TYPE_LABEL } from "../../utils/labels"
import { productInfoSchema, type ProductInfoFormValues } from "../../schemas/catalog.schema"
import type { ProductDetail } from "../../types/catalog.types"

export function ProductInfoSection({
    product,
    categories,
    editing,
    onToggleEdit,
}: {
    product: ProductDetail
    categories: Array<{ id: string; name: string }>
    editing: boolean
    onToggleEdit: () => void
}) {
    const updateMutation = useUpdateProduct(product.id)
    const [values, setValues] = useState<ProductInfoFormValues>(() => ({
        name: product.name,
        category_id: product.category_id,
        description: product.description ?? "",
        product_type: product.product_type,
    }))
    const [errors, setErrors] = useState<Record<string, string>>({})

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const parsed = productInfoSchema.safeParse(values)

        if (!parsed.success) {
            setErrors(issuesToMessages(parsed.error.issues))
            return
        }

        setErrors({})

        updateMutation.mutate(
            {
                name: parsed.data.name,
                category_id: parsed.data.category_id,
                description: parsed.data.description ?? null,
            },
            {
                onSuccess: () => {
                    notifySuccess("Informasi disimpan")
                    onToggleEdit()
                },
                onError: (error) => {
                    const fieldErrors = applyServerFieldErrors(error, ["name", "category_id", "description"])

                    if (Object.keys(fieldErrors).length > 0) {
                        setErrors(fieldErrors)
                        return
                    }

                    notifyError(catalogErrorMessage(error, "Gagal menyimpan informasi"))
                },
            }
        )
    }

    if (editing) {
        return (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <Field>
                    <FieldLabel htmlFor="edit-name">Nama Produk</FieldLabel>
                    <Input
                        id="edit-name"
                        value={values.name}
                        onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
                        aria-invalid={errors.name !== undefined}
                        className="h-11"
                    />
                    {errors.name !== undefined ? <FieldError>{errors.name}</FieldError> : null}
                </Field>

                <Field>
                    <FieldLabel htmlFor="edit-category">Kategori</FieldLabel>
                    <Select
                        value={values.category_id}
                        onValueChange={(value) =>
                            setValues((current) => ({ ...current, category_id: value ?? current.category_id }))
                        }
                    >
                        <SelectTrigger id="edit-category" className="h-11 w-full">
                            <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.category_id !== undefined ? <FieldError>{errors.category_id}</FieldError> : null}
                </Field>

                <Field>
                    <FieldLabel htmlFor="edit-description">Deskripsi (opsional)</FieldLabel>
                    <Textarea
                        id="edit-description"
                        value={values.description ?? ""}
                        onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                        rows={3}
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="edit-type">Tipe Produk</FieldLabel>
                    <Input
                        id="edit-type"
                        value={PRODUCT_TYPE_LABEL[product.product_type]}
                        readOnly
                        disabled
                        className="h-11"
                    />
                    <Text variant="xs" className="text-muted-foreground">
                        Tipe produk tidak dapat diubah setelah produk dibuat.
                    </Text>
                </Field>

                <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={onToggleEdit}>
                        Batal
                    </Button>
                    <Button type="submit" className="flex-1" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? (
                            <>
                                <Spinner /> Menyimpan…
                            </>
                        ) : (
                            "Simpan"
                        )}
                    </Button>
                </div>
            </form>
        )
    }

    return (
        <DetailRows
            rows={[
                { term: "Nama", value: product.name },
                { term: "Kategori", value: product.category?.name ?? "Tanpa kategori" },
                { term: "Deskripsi", value: product.description ?? "-" },
                { term: "Tipe produk", value: PRODUCT_TYPE_LABEL[product.product_type] },
            ]}
        />
    )
}
