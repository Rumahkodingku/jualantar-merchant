import { useState } from "react"
import { FormDialog } from "../common/form-dialog"
import { MoneyField, NameField, ToggleField } from "../common/form-fields"
import { useFieldErrors } from "../common/use-field-errors"
import { applyServerFieldErrors, catalogErrorMessage } from "../../utils/api-error"
import { issuesToMessages } from "../../utils/issues"
import { notifyError, notifySuccess } from "~/lib/notify"
import { variantRowSchema, type VariantRowValues } from "../../schemas"
import { useCreateVariant, useUpdateVariant } from "../../services/variants/variant.mutations"
import type { CatalogStatus } from "../../types"

export type FormMode = "server" | "draft" | "edit"

export function allowsStatusChoice(mode: FormMode): boolean {
    return mode === "server" || mode === "edit"
}

export interface VariantPayload {
    name: string
    sku: string | null
    price: number
    is_default: boolean
}

export interface VariantPayloadWithStatus extends VariantPayload {
    status: CatalogStatus
}

export interface ExistingVariant {
    id?: string
    name: string
    sku: string | null
    price: number
    status: CatalogStatus
    is_default: boolean
}

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
    productId?: string
    variant?: ExistingVariant
    onClose: () => void
    onSubmit?: (payload: VariantPayloadWithStatus) => void
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

        const payload: VariantPayload = {
            name: parsed.data.name,
            sku: parsed.data.sku === "" || parsed.data.sku === undefined ? null : parsed.data.sku,
            price: parsed.data.price,
            is_default: parsed.data.is_default,
        }

        if (mode !== "server") {
            onSubmit?.({ ...payload, status: parsed.data.status })
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
            description={
                variant === undefined ? "Tambah variant sesuai kebutuhan produk" : "Edit variant sesuai kebutuan produk"
            }
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
                placeholder="cth: Biasa"
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
                placeholder="cth: SKU-001-XYZ"
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

            {allowsStatusChoice(mode) ? (
                <ToggleField
                    label="Status aktif"
                    description="Nonaktifkan untuk menyembunyikan variant."
                    ariaLabel="Status aktif variant"
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
