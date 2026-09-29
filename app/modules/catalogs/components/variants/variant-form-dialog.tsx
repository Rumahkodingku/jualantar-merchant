import { useState } from "react"

import { FormDialog } from "../common/form-dialog"
import { DescriptionField, MoneyField, NameField, ToggleField } from "../common/form-fields"
import { useFieldErrors } from "../common/use-field-errors"
import { applyServerFieldErrors, catalogErrorMessage } from "../../utils/api-error"
import { issuesToMessages } from "../../utils/issues"
import { notifyError, notifySuccess } from "~/lib/notify"
import { variantRowSchema, type VariantRowValues } from "../../schemas"
import { useCreateVariant, useUpdateVariant } from "../../services/variants/variant.mutations"
import type { CatalogStatus } from "../../types"

/**
 * Where the form ends up decides how it saves, and nothing else.
 *
 * `server` writes straight to the API and reports field errors the backend
 * sends back. `draft` hands the validated values to `onSubmit` and stops there,
 * because the wizard owns the row until the whole product is saved — there is
 * no server to report against yet, and a variant staged in a draft is not
 * allowed to carry a status the merchant never chose.
 */
export type FormMode = "server" | "draft"

/** The parts of a variant the API takes, with the blank-SKU difference folded in. */
export interface VariantPayload {
    name: string
    sku: string | null
    price: number
    is_default: boolean
}

/**
 * The subset of a variant the form reads. Both a saved variant and a staged
 * draft row satisfy it, which is what lets one dialog edit either.
 */
export interface ExistingVariant {
    id?: string
    name: string
    sku: string | null
    price: number
    status: CatalogStatus
    is_default: boolean
}

/** A staged draft row has no server id yet, which is how the two are told apart. */
function variantIdOf(variant: ExistingVariant | undefined): string {
    return variant?.id ?? ""
}

export function VariantFormDialog({
    mode,
    productId,
    variant,
    onClose,
    onSubmit,
}: {
    mode: FormMode
    /** Only needed in `server` mode; a draft row is not attached to a product yet. */
    productId?: string
    variant?: ExistingVariant
    onClose: () => void
    onSubmit?: (payload: VariantPayload) => void
}) {
    const [values, setValues] = useState<VariantRowValues>(() => ({
        name: variant?.name ?? "",
        sku: variant?.sku ?? "",
        price: variant?.price ?? 0,
        status: variant?.status ?? "active",
        is_default: variant?.is_default ?? false,
    }))
    const { errors, setErrors, clear } = useFieldErrors()

    const createMutation = useCreateVariant(productId ?? "")
    const updateMutation = useUpdateVariant(productId ?? "", variantIdOf(variant))
    const isPending = mode === "server" && (createMutation.isPending || updateMutation.isPending)

    function handleSubmit() {
        const parsed = variantRowSchema.safeParse(values)

        if (!parsed.success) {
            setErrors(issuesToMessages(parsed.error.issues))
            return
        }

        // The API reads a blank SKU as `null`; the draft keeps it as an empty
        // string, which is the state the input actually holds.
        const payload: VariantPayload = {
            name: parsed.data.name,
            sku: parsed.data.sku === "" || parsed.data.sku === undefined ? null : parsed.data.sku,
            price: parsed.data.price,
            is_default: parsed.data.is_default,
        }

        if (mode === "draft") {
            onSubmit?.(payload)
            return
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
        <FormDialog
            title={variant === undefined ? "Tambah variant" : "Edit variant"}
            isPending={isPending}
            onClose={onClose}
            onSubmit={handleSubmit}
        >
            <NameField
                id="variant-name"
                label="Nama"
                value={values.name}
                error={errors.name}
                onChange={(name) => {
                    setValues((current) => ({ ...current, name }))
                    clear("name")
                }}
            />

            <NameField
                id="variant-sku"
                label="SKU (opsional)"
                value={values.sku ?? ""}
                error={errors.sku}
                onChange={(sku) => {
                    setValues((current) => ({ ...current, sku }))
                    clear("sku")
                }}
            />

            <MoneyField
                id="variant-price"
                label="Harga (Rp)"
                value={values.price}
                error={errors.price}
                onChange={(price) => {
                    setValues((current) => ({ ...current, price }))
                    clear("price")
                }}
            />

            <ToggleField
                label="Variant utama"
                description="Jadikan sebagai pilihan default."
                checked={values.is_default}
                onCheckedChange={(is_default) => {
                    setValues((current) => ({ ...current, is_default }))
                    clear("is_default")
                }}
            />

            {/* A staged variant cannot be deactivated: the draft always keeps it
                live, and status is decided when the product itself is created. */}
            {mode === "server" ? (
                <ToggleField
                    label="Status aktif"
                    description="Nonaktifkan untuk menyembunyikan variant."
                    checked={values.status === "active"}
                    onCheckedChange={(active) => {
                        setValues((current) => ({ ...current, status: active ? "active" : "inactive" }))
                        clear("status")
                    }}
                />
            ) : null}
        </FormDialog>
    )
}
