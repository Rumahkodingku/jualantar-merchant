import { useState } from "react"

import { Button } from "~/components/ui/button"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"

import { useUpdateProduct } from "../../services/products/product.mutations"
import { applyServerFieldErrors, catalogErrorMessage } from "../../utils/api-error"
import { issuesToMessages } from "../../utils/issues"
import { notifyError, notifySuccess } from "~/lib/notify"
import { formatCurrency } from "../../utils/format-currency"
import { simplePriceSchema } from "../../schemas/catalog.schema"
import type { ProductDetail } from "../../types/catalog.types"

export function ProductPriceSection({
    product,
    editing,
    onToggleEdit,
}: {
    product: ProductDetail
    editing: boolean
    onToggleEdit: () => void
}) {
    const updateMutation = useUpdateProduct(product.id)
    const [priceRaw, setPriceRaw] = useState(() => (product.price != null ? String(product.price) : ""))
    const [errors, setErrors] = useState<Record<string, string>>({})

    if (product.product_type === "variable") {
        return null
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const parsed = simplePriceSchema.safeParse({ price: priceRaw })

        if (!parsed.success) {
            setErrors(issuesToMessages(parsed.error.issues))
            return
        }

        setErrors({})

        updateMutation.mutate(
            { price: parsed.data.price },
            {
                onSuccess: () => {
                    notifySuccess("Harga disimpan")
                    onToggleEdit()
                },
                onError: (error) => {
                    const fieldErrors = applyServerFieldErrors(error, ["price"])

                    if (Object.keys(fieldErrors).length > 0) {
                        setErrors(fieldErrors)
                        return
                    }

                    notifyError(catalogErrorMessage(error, "Gagal menyimpan harga"))
                },
            }
        )
    }

    if (editing) {
        return (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <Field>
                    <FieldLabel htmlFor="edit-price">Harga (Rp)</FieldLabel>
                    <Input
                        id="edit-price"
                        inputMode="numeric"
                        value={priceRaw}
                        onChange={(event) => {
                            setPriceRaw(event.target.value)
                            setErrors({})
                        }}
                        aria-invalid={errors.price !== undefined}
                        className="h-11"
                    />
                    {errors.price !== undefined ? <FieldError>{errors.price}</FieldError> : null}
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
        <Text variant="base" weight="semibold">
            {formatCurrency(product.price)}
        </Text>
    )
}
