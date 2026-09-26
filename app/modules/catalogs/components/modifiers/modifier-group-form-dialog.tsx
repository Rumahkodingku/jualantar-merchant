import { useState } from "react"

import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Spinner } from "~/components/ui/spinner"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"

import { useCreateModifierGroup, useUpdateModifierGroup } from "../../services/modifiers/modifier.mutations"
import { applyServerFieldErrors, catalogErrorMessage, firstServerFieldError } from "../../utils/api-error"
import { issuesToMessages } from "../../utils/issues"
import { SELECTION_TYPE_OPTIONS } from "../../utils/labels"
import { notifyError, notifySuccess } from "~/lib/notify"
import { modifierGroupSchema, type ModifierGroupFormValues } from "../../schemas/catalog.schema"
import type { ProductModifierGroup, SelectionType } from "../../types/catalog.types"

function groupDefaults(group?: ProductModifierGroup): ModifierGroupFormValues {
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
    productId,
    group,
    onClose,
}: {
    productId: string
    group?: ProductModifierGroup
    onClose: () => void
}) {
    const [values, setValues] = useState<ModifierGroupFormValues>(() => groupDefaults(group))
    const [errors, setErrors] = useState<Record<string, string>>({})

    const createMutation = useCreateModifierGroup(productId)
    const updateMutation = useUpdateModifierGroup(productId, group?.id ?? "")
    const isPending = createMutation.isPending || updateMutation.isPending

    function setField<K extends keyof ModifierGroupFormValues>(key: K, value: ModifierGroupFormValues[K]) {
        setValues((current) => ({ ...current, [key]: value }))
        setErrors((current) => {
            const next = { ...current }

            delete next[key as string]

            return next
        })
    }

    function setMinSelection(value: number) {
        setValues((current) => ({ ...current, min_selection: value, is_required: value >= 1 }))
        setErrors((current) => {
            const next = { ...current }

            delete next.min_selection
            delete next.is_required

            return next
        })
    }

    function setRequired(isRequired: boolean) {
        setValues((current) => ({
            ...current,
            is_required: isRequired,
            min_selection: isRequired ? Math.max(current.min_selection, 1) : 0,
        }))
        setErrors((current) => {
            const next = { ...current }

            delete next.is_required
            delete next.min_selection

            return next
        })
    }

    function setSelectionType(selectionType: SelectionType) {
        setValues((current) => {
            const minSelection = selectionType === "single" ? Math.min(current.min_selection, 1) : current.min_selection

            return {
                ...current,
                selection_type: selectionType,
                min_selection: minSelection,
                is_required: minSelection >= 1,
                max_selection_raw: selectionType === "single" ? "" : current.max_selection_raw,
            }
        })
        setErrors((current) => {
            const next = { ...current }

            delete next.selection_type
            delete next.max_selection_raw
            delete next.min_selection
            delete next.is_required

            return next
        })
    }

    const isMultiple = values.selection_type === "multiple"

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const parsed = modifierGroupSchema.safeParse(values)

        if (!parsed.success) {
            setErrors(issuesToMessages(parsed.error.issues))
            return
        }

        const payload = {
            name: parsed.data.name,
            description: parsed.data.description,
            selection_type: parsed.data.selection_type,
            min_selection: parsed.data.min_selection,
            max_selection: isMultiple
                ? parsed.data.max_selection_raw === ""
                    ? null
                    : parsed.data.max_selection_raw
                : 1,
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
        <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{group === undefined ? "Tambah modifier group" : "Edit modifier group"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                    <Field>
                        <FieldLabel htmlFor="group-name">Nama group</FieldLabel>
                        <Input
                            id="group-name"
                            value={values.name}
                            onChange={(event) => setField("name", event.target.value)}
                            aria-invalid={errors.name !== undefined}
                            className="h-11"
                        />
                        {errors.name !== undefined ? <FieldError>{errors.name}</FieldError> : null}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="group-description">Deskripsi (opsional)</FieldLabel>
                        <Input
                            id="group-description"
                            value={values.description ?? ""}
                            onChange={(event) => setField("description", event.target.value)}
                            className="h-11"
                        />
                    </Field>

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
                                {errors.min_selection !== undefined ? (
                                    <FieldError>{errors.min_selection}</FieldError>
                                ) : null}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="group-max">Max pilihan</FieldLabel>
                                <Input
                                    id="group-max"
                                    inputMode="numeric"
                                    placeholder="Tidak dibatasi"
                                    value={values.max_selection_raw === "" ? "" : String(values.max_selection_raw)}
                                    onChange={(event) =>
                                        setField(
                                            "max_selection_raw",
                                            event.target.value === "" ? "" : Number(event.target.value)
                                        )
                                    }
                                    aria-invalid={errors.max_selection_raw !== undefined}
                                    className="h-11"
                                />
                                {errors.max_selection_raw !== undefined ? (
                                    <FieldError>{errors.max_selection_raw}</FieldError>
                                ) : null}
                            </Field>
                        </div>
                    ) : null}

                    <Field>
                        <div className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5">
                            <div className="flex flex-col">
                                <Text variant="sm" weight="medium">
                                    Wajib dipilih
                                </Text>
                                <Text variant="xs" className="text-muted-foreground">
                                    {values.is_required
                                        ? isMultiple
                                            ? `Customer wajib memilih minimal ${values.min_selection} opsi.`
                                            : "Customer wajib memilih satu opsi."
                                        : "Customer boleh tidak memilih."}
                                </Text>
                            </div>
                            <Switch
                                checked={values.is_required}
                                onCheckedChange={(checked) => setRequired(checked === true)}
                                aria-label="Wajib dipilih"
                            />
                        </div>
                        {errors.is_required !== undefined ? <FieldError>{errors.is_required}</FieldError> : null}
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
