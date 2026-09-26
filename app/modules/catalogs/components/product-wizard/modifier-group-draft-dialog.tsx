import { useState } from "react"

import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"

import { issuesToMessages } from "../../utils/issues"
import { SELECTION_TYPE_OPTIONS } from "../../utils/labels"
import { modifierGroupSchema, type ModifierGroupFormValues } from "../../schemas/catalog.schema"
import type { SelectionType } from "../../types/catalog.types"
import type { GroupDraft, GroupDraftPayload } from "./types"

function groupDefaults(group?: GroupDraft): ModifierGroupFormValues {
    return {
        name: group?.name ?? "",
        description: group?.description ?? "",
        selection_type: group?.selection_type ?? "single",
        min_selection: group?.min_selection ?? 0,
        max_selection_raw: group?.max_selection ?? "",
        is_required: group?.is_required ?? false,
    }
}

export function ModifierGroupDraftDialog({
    group,
    onClose,
    onSubmit,
}: {
    group?: GroupDraft
    onClose: () => void
    onSubmit: (payload: GroupDraftPayload) => void
}) {
    const [values, setValues] = useState<ModifierGroupFormValues>(() => groupDefaults(group))
    const [errors, setErrors] = useState<Record<string, string>>({})

    function setField<K extends keyof ModifierGroupFormValues>(key: K, value: ModifierGroupFormValues[K]) {
        setValues((current) => ({ ...current, [key]: value }))
        setErrors((current) => {
            const next = { ...current }

            delete next[key as string]

            return next
        })
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const parsed = modifierGroupSchema.safeParse(values)

        if (!parsed.success) {
            setErrors(issuesToMessages(parsed.error.issues))
            return
        }

        onSubmit({
            name: parsed.data.name,
            description: parsed.data.description ?? "",
            selection_type: parsed.data.selection_type,
            min_selection: parsed.data.min_selection,
            max_selection: parsed.data.max_selection_raw === "" ? null : parsed.data.max_selection_raw,
            is_required: parsed.data.is_required,
        })
    }

    return (
        <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{group === undefined ? "Tambah modifier group" : "Edit modifier group"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                    <Field>
                        <FieldLabel htmlFor="draft-group-name">Nama group</FieldLabel>
                        <Input
                            id="draft-group-name"
                            value={values.name}
                            onChange={(event) => setField("name", event.target.value)}
                            aria-invalid={errors.name !== undefined}
                            className="h-11"
                        />
                        {errors.name !== undefined ? <FieldError>{errors.name}</FieldError> : null}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="draft-group-description">Deskripsi (opsional)</FieldLabel>
                        <Input
                            id="draft-group-description"
                            value={values.description ?? ""}
                            onChange={(event) => setField("description", event.target.value)}
                            className="h-11"
                        />
                    </Field>
                    <Field>
                        <FieldLabel id="draft-group-selection">Tipe seleksi</FieldLabel>
                        <Select
                            items={SELECTION_TYPE_OPTIONS}
                            value={values.selection_type}
                            onValueChange={(value) => setField("selection_type", (value ?? "single") as SelectionType)}
                        >
                            <SelectTrigger className="w-full" aria-labelledby="draft-group-selection">
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
                    <div className="grid grid-cols-2 gap-3">
                        <Field>
                            <FieldLabel htmlFor="draft-group-min">Min</FieldLabel>
                            <Input
                                id="draft-group-min"
                                inputMode="numeric"
                                value={String(values.min_selection)}
                                onChange={(event) => setField("min_selection", Number(event.target.value))}
                                aria-invalid={errors.min_selection !== undefined}
                                className="h-11"
                            />
                            {errors.min_selection !== undefined ? (
                                <FieldError>{errors.min_selection}</FieldError>
                            ) : null}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="draft-group-max">Max</FieldLabel>
                            <Input
                                id="draft-group-max"
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
                    <div className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5">
                        <Text variant="sm" weight="medium">
                            Wajib dipilih
                        </Text>
                        <Switch
                            checked={values.is_required}
                            onCheckedChange={(checked) => setField("is_required", checked === true)}
                        />
                    </div>
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
