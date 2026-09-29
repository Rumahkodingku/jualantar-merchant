import { useState } from "react"

import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"

import { FormDialog } from "../common/form-dialog"
import { NameField, ToggleField } from "../common/form-fields"
import { useFieldErrors } from "../common/use-field-errors"
import { applyServerFieldErrors, catalogErrorMessage, firstServerFieldError } from "../../utils/api-error"
import { issuesToMessages } from "../../utils/issues"
import { SELECTION_TYPE_OPTIONS } from "../../utils/labels"
import { notifyError, notifySuccess } from "~/lib/notify"
import { modifierGroupSchema, type ModifierGroupFormValues } from "../../schemas"
import { useCreateModifierGroup, useUpdateModifierGroup } from "../../services/modifiers/modifier.mutations"
import type { SelectionType } from "../../types"
import type { FormMode } from "../variants/variant-form-dialog"

/**
 * The parts of a modifier group the API takes. A description that was never
 * written is `null` on the wire, while the wizard keeps the empty string its
 * input holds — so the draft shape is a separate type rather than a nullable
 * field the caller has to remember to narrow.
 */
export interface ModifierGroupPayload {
    name: string
    description: string | null
    selection_type: SelectionType
    min_selection: number
    max_selection: number | null
    is_required: boolean
}

/** The same group as the draft stores it. */
export interface ModifierGroupDraftPayload extends Omit<ModifierGroupPayload, "description"> {
    description: string
}

/** What the form reads, satisfied by both a saved group and a staged draft. */
export interface ExistingModifierGroup {
    id?: string
    name: string
    description: string | null
    selection_type: SelectionType
    min_selection: number
    max_selection: number | null
    is_required: boolean
}

function groupDefaults(group?: ExistingModifierGroup): ModifierGroupFormValues {
    return {
        name: group?.name ?? "",
        description: group?.description ?? "",
        selection_type: group?.selection_type ?? "single",
        min_selection: group?.min_selection ?? 0,
        max_selection_raw: group?.max_selection ?? "",
        is_required: group?.is_required ?? false,
    }
}

export function ModifierGroupFormDialog({
    mode,
    productId,
    group,
    onClose,
    onSubmit,
}: {
    mode: FormMode
    productId?: string
    group?: ExistingModifierGroup
    onClose: () => void
    onSubmit?: (payload: ModifierGroupDraftPayload) => void
}) {
    const [values, setValues] = useState<ModifierGroupFormValues>(() => groupDefaults(group))
    const { errors, setErrors, clear } = useFieldErrors()

    const createMutation = useCreateModifierGroup(productId ?? "")
    const updateMutation = useUpdateModifierGroup(productId ?? "", group?.id ?? "")
    const isPending = mode === "server" && (createMutation.isPending || updateMutation.isPending)

    const isMultiple = values.selection_type === "multiple"

    /**
     * The three controls are not independent: `required` is derived from
     * whether a minimum exists, and a single-select group can only ever ask for
     * one. Each change moves the others with it so the form never sits in a
     * state the schema would reject on submit.
     */
    function setMinSelection(min_selection: number) {
        setValues((current) => ({ ...current, min_selection, is_required: min_selection >= 1 }))
        clear("min_selection", "is_required")
    }

    function setRequired(is_required: boolean) {
        setValues((current) => ({
            ...current,
            is_required,
            min_selection: is_required ? Math.max(current.min_selection, 1) : 0,
        }))
        clear("is_required", "min_selection")
    }

    function setSelectionType(selection_type: SelectionType) {
        setValues((current) => {
            const min_selection =
                selection_type === "single" ? Math.min(current.min_selection, 1) : current.min_selection

            return {
                ...current,
                selection_type,
                min_selection,
                is_required: min_selection >= 1,
                max_selection_raw: selection_type === "single" ? "" : current.max_selection_raw,
            }
        })
        clear("selection_type", "max_selection_raw", "min_selection", "is_required")
    }

    function handleSubmit() {
        const parsed = modifierGroupSchema.safeParse(values)

        if (!parsed.success) {
            setErrors(issuesToMessages(parsed.error.issues))
            return
        }

        // A single-select group is always exactly one choice; "unbounded" only
        // makes sense for multiple.
        const max_selection = isMultiple
            ? parsed.data.max_selection_raw === ""
                ? null
                : parsed.data.max_selection_raw
            : 1

        if (mode === "draft") {
            // A draft keeps the empty string its input holds; the API reads a
            // description that was never written as `null`.
            onSubmit?.({
                name: parsed.data.name,
                description: parsed.data.description ?? "",
                selection_type: parsed.data.selection_type,
                min_selection: parsed.data.min_selection,
                max_selection,
                is_required: parsed.data.is_required,
            })
            return
        }

        const payload: ModifierGroupPayload = {
            name: parsed.data.name,
            description: parsed.data.description ?? null,
            selection_type: parsed.data.selection_type,
            min_selection: parsed.data.min_selection,
            max_selection,
            is_required: parsed.data.is_required,
        }

        const onSuccess = () => {
            notifySuccess(group === undefined ? "Modifier group dibuat" : "Modifier group diperbarui")
            onClose()
        }

        const onError = (error: unknown) => {
            const fieldErrors = applyServerFieldErrors(
                error,
                ["name", "description", "min_selection", "max_selection", "is_required"],
                { max_selection: "max_selection_raw" }
            )

            if (Object.keys(fieldErrors).length > 0) {
                setErrors(fieldErrors)
                return
            }

            notifyError(firstServerFieldError(error) ?? catalogErrorMessage(error, "Gagal menyimpan group"))
        }

        if (group === undefined) {
            createMutation.mutate(payload, { onSuccess, onError })
        } else {
            updateMutation.mutate(payload, { onSuccess, onError })
        }
    }

    return (
        <FormDialog
            title={group === undefined ? "Tambah modifier group" : "Edit modifier group"}
            isPending={isPending}
            onClose={onClose}
            onSubmit={handleSubmit}
        >
            <NameField
                id="group-name"
                label="Nama group"
                value={values.name}
                error={errors.name}
                onChange={(name) => {
                    setValues((current) => ({ ...current, name }))
                    clear("name")
                }}
            />

            <NameField
                id="group-description"
                label="Deskripsi (opsional)"
                value={values.description ?? ""}
                onChange={(description) => {
                    setValues((current) => ({ ...current, description }))
                    clear("description")
                }}
            />

            <Field>
                <FieldLabel id="group-selection-label">Tipe seleksi</FieldLabel>
                <Select
                    items={SELECTION_TYPE_OPTIONS}
                    value={values.selection_type}
                    onValueChange={(value) => setSelectionType((value ?? "single") as SelectionType)}
                >
                    <SelectTrigger className="w-full" aria-labelledby="group-selection-label">
                        <SelectValue placeholder="Pilih tipe seleksi" />
                    </SelectTrigger>
                    <SelectContent>
                        {SELECTION_TYPE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>

            {isMultiple ? (
                <div className="grid grid-cols-2 gap-3">
                    <Field>
                        <FieldLabel htmlFor="group-min">Min pilihan</FieldLabel>
                        <Input
                            id="group-min"
                            inputMode="numeric"
                            value={String(values.min_selection)}
                            onChange={(event) => setMinSelection(Number(event.target.value))}
                            disabled={!values.is_required}
                            aria-invalid={errors.min_selection !== undefined}
                            className="h-11"
                        />
                        {errors.min_selection !== undefined ? <FieldError>{errors.min_selection}</FieldError> : null}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="group-max">Max pilihan</FieldLabel>
                        <Input
                            id="group-max"
                            inputMode="numeric"
                            placeholder="Tidak dibatasi"
                            value={values.max_selection_raw === "" ? "" : String(values.max_selection_raw)}
                            onChange={(event) => {
                                const raw = event.target.value
                                setValues((current) => ({
                                    ...current,
                                    max_selection_raw: raw === "" ? "" : Number(raw),
                                }))
                                clear("max_selection_raw")
                            }}
                            aria-invalid={errors.max_selection_raw !== undefined}
                            className="h-11"
                        />
                        {errors.max_selection_raw !== undefined ? (
                            <FieldError>{errors.max_selection_raw}</FieldError>
                        ) : null}
                    </Field>
                </div>
            ) : null}

            <ToggleField
                label="Wajib dipilih"
                description="Customer boleh tidak memilih."
                checkedDescription={
                    isMultiple
                        ? `Customer wajib memilih minimal ${values.min_selection} opsi.`
                        : "Customer wajib memilih satu opsi."
                }
                checked={values.is_required}
                onCheckedChange={setRequired}
                error={errors.is_required}
                ariaLabel="Wajib dipilih"
            />
        </FormDialog>
    )
}
