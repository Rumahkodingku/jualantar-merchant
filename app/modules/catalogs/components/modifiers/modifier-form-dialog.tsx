import { useState } from "react"

import { FormDialog } from "../common/form-dialog"
import { DescriptionField, MoneyField, NameField, ToggleField } from "../common/form-fields"
import { useFieldErrors } from "../common/use-field-errors"
import { applyServerFieldErrors, catalogErrorMessage } from "../../utils/api-error"
import { issuesToMessages } from "../../utils/issues"
import { notifyError, notifySuccess } from "~/lib/notify"
import { modifierSchema, type ModifierFormValues } from "../../schemas"
import { useCreateModifier, useUpdateModifier } from "../../services/modifiers/modifier.mutations"
import type { CatalogStatus } from "../../types"
import { allowsStatusChoice, type FormMode } from "../variants/variant-form-dialog"

/**
 * The parts of a modifier the API takes. A description that was never written
 * is `null` on the wire, while the wizard keeps the empty string its input
 * holds — so the draft shape is a separate type rather than a nullable field
 * the caller has to remember to narrow.
 */
export interface ModifierPayload {
    name: string
    description: string | null
    price: number
    is_default: boolean
}

/**
 * What a staged row gets back. As with variants, the modifier endpoints do not
 * take a status — it moves through activate/deactivate — so it travels beside
 * the payload and is applied separately by whoever saves the row. The
 * description stays the empty string its input holds, exactly as a draft keeps
 * it; the API reads an unwritten one as `null` at the moment of writing.
 */
export type ModifierDraftPayloadWithStatus = ModifierDraftPayload & { status: CatalogStatus }

/** The same modifier as the draft stores it. */
export interface ModifierDraftPayload extends Omit<ModifierPayload, "description"> {
    description: string
}

/** What the form reads, satisfied by both a saved modifier and a staged draft. */
export interface ExistingModifier {
    id?: string
    name: string
    description: string | null
    price: number
    is_default: boolean
    status?: CatalogStatus
}

export function ModifierFormDialog({
    mode,
    productId,
    groupId,
    modifier,
    onClose,
    onSubmit,
}: {
    mode: FormMode
    productId?: string
    groupId?: string
    modifier?: ExistingModifier
    onClose: () => void
    onSubmit?: (payload: ModifierDraftPayloadWithStatus) => void
}) {
    const [values, setValues] = useState<ModifierFormValues>(() => ({
        name: modifier?.name ?? "",
        description: modifier?.description ?? "",
        price: modifier?.price ?? 0,
        is_default: modifier?.is_default ?? false,
    }))
    // Status is not part of the modifier's validated payload — the API moves it
    // through activate/deactivate — so it is held beside the form and only
    // offered where the merchant is allowed to choose it.
    const [status, setStatus] = useState<CatalogStatus>(modifier?.status ?? "active")
    const { errors, setErrors, clear } = useFieldErrors()

    const createMutation = useCreateModifier(productId ?? "", groupId ?? "")
    const updateMutation = useUpdateModifier(productId ?? "", groupId ?? "", modifier?.id ?? "")
    const isPending = mode === "server" && (createMutation.isPending || updateMutation.isPending)

    function handleSubmit() {
        const parsed = modifierSchema.safeParse(values)

        if (!parsed.success) {
            setErrors(issuesToMessages(parsed.error.issues))
            return
        }

        if (mode !== "server") {
            onSubmit?.({
                name: parsed.data.name,
                description: parsed.data.description ?? "",
                price: parsed.data.price,
                is_default: parsed.data.is_default,
                status,
            })
            return
        }

        const payload: ModifierPayload = {
            name: parsed.data.name,
            // The API wants `null` for a description that was never written.
            description: parsed.data.description ?? null,
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
        <FormDialog
            title={modifier === undefined ? "Tambah modifier" : "Edit modifier"}
            isPending={isPending}
            onClose={onClose}
            onSubmit={handleSubmit}
        >
            <NameField
                id="modifier-name"
                label="Nama"
                value={values.name}
                error={errors.name}
                onChange={(name) => {
                    setValues((current) => ({ ...current, name }))
                    clear("name")
                }}
            />

            <DescriptionField
                id="modifier-description"
                label="Deskripsi (opsional)"
                value={values.description ?? ""}
                onChange={(description) => {
                    setValues((current) => ({ ...current, description }))
                    clear("description")
                }}
            />

            <MoneyField
                id="modifier-price"
                label="Harga tambahan (Rp)"
                value={values.price}
                error={errors.price}
                onChange={(price) => {
                    setValues((current) => ({ ...current, price }))
                    clear("price")
                }}
            />

            <ToggleField
                label="Dipilih secara default"
                description="Opsi ini terpilih otomatis oleh pelanggan."
                checked={values.is_default}
                onCheckedChange={(is_default) => {
                    setValues((current) => ({ ...current, is_default }))
                    clear("is_default")
                }}
            />

            {/* A product that does not exist yet has no status to speak of, so the
                create wizard never offers the choice. An existing product does,
                and hiding an option is exactly the kind of edit this screen is
                for. */}
            {allowsStatusChoice(mode) ? (
                <ToggleField
                    label="Status aktif"
                    description="Nonaktifkan untuk menyembunyikan pilihan ini dari pelanggan."
                    ariaLabel="Status aktif pilihan"
                    checked={status === "active"}
                    onCheckedChange={(active) => setStatus(active ? "active" : "inactive")}
                />
            ) : null}
        </FormDialog>
    )
}
