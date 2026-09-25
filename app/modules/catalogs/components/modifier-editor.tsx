import { useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Spinner } from "~/components/ui/spinner"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"

import { StatusBadge } from "./status-badge"
import {
    useCreateModifier,
    useCreateModifierGroup,
    useDeleteModifier,
    useDeleteModifierGroup,
    useReorderModifierGroups,
    useSetModifierGroupStatus,
    useSetModifierStatus,
    useUpdateModifier,
    useUpdateModifierGroup,
} from "../services/catalog.mutations"
import { formatCurrency } from "../utils/format-currency"
import { notifyError, notifySuccess } from "../utils/notify"
import { SELECTION_TYPE_LABEL } from "../utils/labels"
import {
    modifierGroupSchema,
    modifierSchema,
    type ModifierFormValues,
    type ModifierGroupFormValues,
} from "../schemas/catalog.schema"
import type { ProductModifier, ProductModifierGroup, SelectionType } from "../types/catalog.types"

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

function modifierDefaults(modifier?: ProductModifier): ModifierFormValues {
    return {
        name: modifier?.name ?? "",
        description: modifier?.description ?? "",
        price: modifier?.price ?? 0,
        is_default: modifier?.is_default ?? false,
    }
}

function issuesToMessages(issues: { path: PropertyKey[]; message: string }[]) {
    const next: Record<string, string> = {}

    for (const issue of issues) {
        const key = String(issue.path[0] ?? "")

        if (next[key] === undefined) {
            next[key] = issue.message
        }
    }

    return next
}

function GroupFormDialog({
    productId,
    group,
    open,
    onOpenChange,
}: {
    productId: string
    group?: ProductModifierGroup
    open: boolean
    onOpenChange: (open: boolean) => void
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
            max_selection: parsed.data.max_selection_raw === "" ? null : parsed.data.max_selection_raw,
            is_required: parsed.data.is_required,
        }

        const onSuccess = () => {
            notifySuccess(group === undefined ? "Modifier group dibuat" : "Modifier group diperbarui")
            onOpenChange(false)
        }

        if (group === undefined) {
            createMutation.mutate(payload, { onSuccess, onError: () => notifyError("Gagal menyimpan group") })
        } else {
            updateMutation.mutate(payload, { onSuccess, onError: () => notifyError("Gagal menyimpan group") })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                            value={values.selection_type}
                            onValueChange={(value) => setField("selection_type", (value ?? "single") as SelectionType)}
                        >
                            <SelectTrigger className="w-full" aria-labelledby="group-selection-label">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="single">Single</SelectItem>
                                <SelectItem value="multiple">Multiple</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field>
                            <FieldLabel htmlFor="group-min">Min pilihan</FieldLabel>
                            <Input
                                id="group-min"
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

                    <div className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5">
                        <div className="flex flex-col">
                            <Text variant="sm" weight="medium">
                                Wajib dipilih
                            </Text>
                            <Text variant="xs" className="text-muted-foreground">
                                Pelanggan wajib memilih minimal {Math.max(1, values.min_selection)} opsi.
                            </Text>
                        </div>
                        <Switch
                            checked={values.is_required}
                            onCheckedChange={(checked) => setField("is_required", checked === true)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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

function ModifierFormDialog({
    productId,
    groupId,
    modifier,
    open,
    onOpenChange,
}: {
    productId: string
    groupId: string
    modifier?: ProductModifier
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const [values, setValues] = useState<ModifierFormValues>(() => modifierDefaults(modifier))
    const [errors, setErrors] = useState<Record<string, string>>({})

    const createMutation = useCreateModifier(productId, groupId)
    const updateMutation = useUpdateModifier(productId, groupId, modifier?.id ?? "")
    const isPending = createMutation.isPending || updateMutation.isPending

    function setField<K extends keyof ModifierFormValues>(key: K, value: ModifierFormValues[K]) {
        setValues((current) => ({ ...current, [key]: value }))
        setErrors((current) => {
            const next = { ...current }
            delete next[key as string]
            return next
        })
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const parsed = modifierSchema.safeParse(values)

        if (!parsed.success) {
            setErrors(issuesToMessages(parsed.error.issues))
            return
        }

        const payload = {
            name: parsed.data.name,
            description: parsed.data.description,
            price: parsed.data.price,
            is_default: parsed.data.is_default,
        }

        const onSuccess = () => {
            notifySuccess(modifier === undefined ? "Modifier ditambahkan" : "Modifier diperbarui")
            onOpenChange(false)
        }

        if (modifier === undefined) {
            createMutation.mutate(payload, { onSuccess, onError: () => notifyError("Gagal menyimpan modifier") })
        } else {
            updateMutation.mutate(payload, { onSuccess, onError: () => notifyError("Gagal menyimpan modifier") })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{modifier === undefined ? "Tambah modifier" : "Edit modifier"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                    <Field>
                        <FieldLabel htmlFor="modifier-name">Nama</FieldLabel>
                        <Input
                            id="modifier-name"
                            value={values.name}
                            onChange={(event) => setField("name", event.target.value)}
                            aria-invalid={errors.name !== undefined}
                            className="h-11"
                        />
                        {errors.name !== undefined ? <FieldError>{errors.name}</FieldError> : null}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="modifier-description">Deskripsi (opsional)</FieldLabel>
                        <Input
                            id="modifier-description"
                            value={values.description ?? ""}
                            onChange={(event) => setField("description", event.target.value)}
                            className="h-11"
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="modifier-price">Harga tambahan (Rp)</FieldLabel>
                        <Input
                            id="modifier-price"
                            inputMode="numeric"
                            value={String(values.price)}
                            onChange={(event) => setField("price", Number(event.target.value))}
                            aria-invalid={errors.price !== undefined}
                            className="h-11"
                        />
                        {errors.price !== undefined ? <FieldError>{errors.price}</FieldError> : null}
                    </Field>

                    <div className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5">
                        <div className="flex flex-col">
                            <Text variant="sm" weight="medium">
                                Dipilih secara default
                            </Text>
                            <Text variant="xs" className="text-muted-foreground">
                                Opsi ini terpilih otomatis oleh pelanggan.
                            </Text>
                        </div>
                        <Switch
                            checked={values.is_default}
                            onCheckedChange={(checked) => setField("is_default", checked === true)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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

function GroupCard({
    productId,
    group,
    onEditGroup,
}: {
    productId: string
    group: ProductModifierGroup
    onEditGroup: (group: ProductModifierGroup) => void
}) {
    const [modifierDialog, setModifierDialog] = useState<{ open: boolean; modifier?: ProductModifier }>({ open: false })
    const [pendingDeleteModifier, setPendingDeleteModifier] = useState<ProductModifier | null>(null)
    const [pendingDeleteGroup, setPendingDeleteGroup] = useState(false)

    const statusMutation = useSetModifierGroupStatus(productId, group.id)
    const deleteGroupMutation = useDeleteModifierGroup(productId)
    const deleteModifierMutation = useDeleteModifier(productId, group.id)
    const reorderModifiers = useReorderModifierGroups(productId)

    function moveModifier(index: number, direction: -1 | 1) {
        const next = [...group.modifiers]
        const target = index + direction

        if (target < 0 || target >= next.length) {
            return
        }

        const [item] = next.splice(index, 1)

        next.splice(target, 0, item)

        reorderModifiers.mutate(
            next.map((modifier, order) => ({ id: modifier.id, display_order: order })),
            { onError: () => notifyError("Gagal mengubah urutan") }
        )
    }

    const selectionLabel = [
        group.is_required ? "Wajib" : "Opsional",
        SELECTION_TYPE_LABEL[group.selection_type],
        group.max_selection != null ? `${group.max_selection} pilihan` : `${group.min_selection}+ pilihan`,
    ].join(" • ")

    return (
        <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 ring-1 ring-foreground/5">
            <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <Text variant="sm" weight="semibold">
                            {group.name}
                        </Text>
                        <StatusBadge status={group.status} />
                    </div>
                    <Text variant="xs" className="text-muted-foreground">
                        {selectionLabel}
                    </Text>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    <Switch
                        checked={group.status === "active"}
                        disabled={statusMutation.isPending}
                        aria-label={`Status group ${group.name}`}
                        onCheckedChange={(checked) =>
                            statusMutation.mutate(checked === true ? "active" : "inactive", {
                                onSuccess: () => notifySuccess("Status group diperbarui"),
                                onError: () => notifyError("Gagal memperbarui status"),
                            })
                        }
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Ubah group ${group.name}`}
                        onClick={() => onEditGroup(group)}
                    >
                        <PencilIcon />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Hapus group ${group.name}`}
                        className="text-destructive"
                        onClick={() => setPendingDeleteGroup(true)}
                    >
                        <Trash2Icon />
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                {group.modifiers.map((modifier, index) => (
                    <div key={modifier.id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                        <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-center gap-2">
                                <Text variant="sm" truncate>
                                    {modifier.name}
                                </Text>
                                {modifier.is_default ? (
                                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                        Default
                                    </span>
                                ) : null}
                            </div>
                            <Text variant="xs" className="text-muted-foreground">
                                + {formatCurrency(modifier.price)}
                            </Text>
                        </div>

                        <StatusBadge status={modifier.status} />

                        <div className="flex shrink-0 items-center gap-0.5">
                            <ModifierStatusSwitch productId={productId} groupId={group.id} modifier={modifier} />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                aria-label={`Naikkan ${modifier.name}`}
                                disabled={index === 0}
                                onClick={() => moveModifier(index, -1)}
                            >
                                <ArrowUpIcon />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                aria-label={`Turunkan ${modifier.name}`}
                                disabled={index === group.modifiers.length - 1}
                                onClick={() => moveModifier(index, 1)}
                            >
                                <ArrowDownIcon />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                aria-label={`Ubah ${modifier.name}`}
                                onClick={() => setModifierDialog({ open: true, modifier })}
                            >
                                <PencilIcon />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                aria-label={`Hapus ${modifier.name}`}
                                className="text-destructive"
                                onClick={() => setPendingDeleteModifier(modifier)}
                            >
                                <Trash2Icon />
                            </Button>
                        </div>
                    </div>
                ))}

                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="self-start"
                    onClick={() => setModifierDialog({ open: true })}
                >
                    <PlusIcon /> Tambah Modifier
                </Button>
            </div>

            <ModifierFormDialog
                productId={productId}
                groupId={group.id}
                modifier={modifierDialog.modifier}
                open={modifierDialog.open}
                onOpenChange={(open) =>
                    setModifierDialog({ open, modifier: open ? modifierDialog.modifier : undefined })
                }
            />

            <AlertDialog
                open={pendingDeleteModifier !== null}
                onOpenChange={(open) => (!open ? setPendingDeleteModifier(null) : undefined)}
            >
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus modifier?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Modifier &ldquo;{pendingDeleteModifier?.name}&rdquo; akan dihapus dari group ini.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={deleteModifierMutation.isPending}
                            onClick={() => {
                                if (pendingDeleteModifier === null) {
                                    return
                                }

                                deleteModifierMutation.mutate(pendingDeleteModifier.id, {
                                    onSuccess: () => {
                                        setPendingDeleteModifier(null)
                                        notifySuccess("Modifier dihapus")
                                    },
                                    onError: () => notifyError("Gagal menghapus modifier"),
                                })
                            }}
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={pendingDeleteGroup}
                onOpenChange={(open) => (!open ? setPendingDeleteGroup(false) : undefined)}
            >
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus modifier group?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Group &ldquo;{group.name}&rdquo; beserta seluruh modifier di dalamnya akan dihapus.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={deleteGroupMutation.isPending}
                            onClick={() => {
                                deleteGroupMutation.mutate(group.id, {
                                    onSuccess: () => {
                                        setPendingDeleteGroup(false)
                                        notifySuccess("Group dihapus")
                                    },
                                    onError: () => notifyError("Gagal menghapus group"),
                                })
                            }}
                        >
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

function ModifierStatusSwitch({
    productId,
    groupId,
    modifier,
}: {
    productId: string
    groupId: string
    modifier: ProductModifier
}) {
    const statusMutation = useSetModifierStatus(productId, groupId, modifier.id)

    return (
        <Switch
            checked={modifier.status === "active"}
            disabled={statusMutation.isPending}
            aria-label={`Status ${modifier.name}`}
            onCheckedChange={(checked) =>
                statusMutation.mutate(checked === true ? "active" : "inactive", {
                    onSuccess: () => notifySuccess("Status modifier diperbarui"),
                    onError: () => notifyError("Gagal memperbarui status"),
                })
            }
        />
    )
}

export function ModifierEditor({ productId, groups }: { productId: string; groups: ProductModifierGroup[] }) {
    const [groupDialog, setGroupDialog] = useState<{ open: boolean; group?: ProductModifierGroup }>({ open: false })

    if (groups.length === 0) {
        return (
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed p-5">
                <Text variant="sm" className="text-muted-foreground">
                    Belum ada customization. Tambahkan modifier group agar pelanggan dapat memilih opsi tambahan.
                </Text>
                <Button type="button" size="sm" onClick={() => setGroupDialog({ open: true })}>
                    <PlusIcon /> Tambah Modifier Group
                </Button>
                <GroupFormDialog
                    productId={productId}
                    open={groupDialog.open}
                    onOpenChange={(open) => setGroupDialog({ open })}
                />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3">
                {groups.map((group) => (
                    <GroupCard
                        key={group.id}
                        productId={productId}
                        group={group}
                        onEditGroup={(target) => setGroupDialog({ open: true, group: target })}
                    />
                ))}
            </div>

            <div>
                <Button type="button" size="sm" variant="outline" onClick={() => setGroupDialog({ open: true })}>
                    <PlusIcon /> Tambah Modifier Group
                </Button>
            </div>

            <GroupFormDialog
                productId={productId}
                group={groupDialog.group}
                open={groupDialog.open}
                onOpenChange={(open) => setGroupDialog({ open, group: open ? groupDialog.group : undefined })}
            />
        </div>
    )
}

export { GroupFormDialog, ModifierFormDialog }
