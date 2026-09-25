import { useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, PencilIcon, PlusIcon, StarIcon, Trash2Icon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"

import { formatCurrency } from "../../utils/format-currency"
import { pickMediaPlaceholder } from "../../services/catalog-mock.repository"
import { modifierGroupSchema, modifierSchema, variantRowSchema } from "../../schemas/catalog.schema"
import type { CatalogOutlet, CatalogStatus, ProductModifierGroup, SelectionType } from "../../types/catalog.types"

export interface VariantDraft {
    key: string
    name: string
    sku: string
    price: number
    status: CatalogStatus
    is_default: boolean
}

export interface ModifierDraft {
    key: string
    name: string
    description: string
    price: number
    is_default: boolean
    status: CatalogStatus
}

export interface GroupDraft {
    key: string
    name: string
    description: string
    selection_type: SelectionType
    min_selection: number
    max_selection: number | null
    is_required: boolean
    status: CatalogStatus
    modifiers: ModifierDraft[]
}

export interface MediaDraft {
    key: string
    url: string
    alt_text: string
    is_primary: boolean
}

function draftKey(prefix: string): string {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

function collectIssues(error: { issues: { path: PropertyKey[]; message: string }[] }) {
    const next: Record<string, string> = {}

    for (const issue of error.issues) {
        const key = String(issue.path[0] ?? "")

        if (next[key] === undefined) {
            next[key] = issue.message
        }
    }

    return next
}

export function VariantDraftEditor({
    variants,
    onChange,
}: {
    variants: VariantDraft[]
    onChange: (variants: VariantDraft[]) => void
}) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingKey, setEditingKey] = useState<string | null>(null)
    const [values, setValues] = useState({ name: "", sku: "", price: 0, is_default: false })
    const [errors, setErrors] = useState<Record<string, string>>({})

    function openCreate() {
        setEditingKey(null)
        setValues({ name: "", sku: "", price: 0, is_default: variants.length === 0 })
        setErrors({})
        setDialogOpen(true)
    }

    function openEdit(variant: VariantDraft) {
        setEditingKey(variant.key)
        setValues({ name: variant.name, sku: variant.sku, price: variant.price, is_default: variant.is_default })
        setErrors({})
        setDialogOpen(true)
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const parsed = variantRowSchema.safeParse({
            name: values.name,
            sku: values.sku,
            price: values.price,
            status: "active",
            is_default: values.is_default,
        })

        if (!parsed.success) {
            setErrors(collectIssues(parsed.error))
            return
        }

        const base: Omit<VariantDraft, "key" | "status"> = {
            name: parsed.data.name,
            sku: parsed.data.sku ?? "",
            price: parsed.data.price,
            is_default: parsed.data.is_default,
        }

        if (editingKey === null) {
            onChange([...variants, { key: draftKey("var"), status: "active", ...base }])
        } else {
            onChange(
                variants.map((variant) =>
                    variant.key === editingKey ? { ...variant, ...base, status: variant.status } : variant
                )
            )
        }

        setDialogOpen(false)
    }

    function move(index: number, direction: -1 | 1) {
        const next = [...variants]
        const target = index + direction

        if (target < 0 || target >= next.length) {
            return
        }

        const [item] = next.splice(index, 1)

        next.splice(target, 0, item)
        onChange(next)
    }

    function setDefault(key: string) {
        onChange(variants.map((variant) => ({ ...variant, is_default: variant.key === key })))
    }

    return (
        <div className="flex flex-col gap-3">
            {variants.length > 0 ? (
                <div className="overflow-hidden rounded-xl border">
                    <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-2 border-b bg-muted/50 px-3 py-2 text-xs font-medium text-muted-foreground sm:grid">
                        <span>Nama</span>
                        <span>Harga</span>
                        <span>Status</span>
                        <span className="w-24 text-right">Aksi</span>
                    </div>
                    {variants.map((variant, index) => (
                        <div
                            key={variant.key}
                            className="grid grid-cols-1 gap-1 border-b px-3 py-2.5 last:border-b-0 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center sm:gap-2"
                        >
                            <div className="flex min-w-0 flex-col">
                                <div className="flex items-center gap-2">
                                    <Text variant="sm" weight="medium" truncate>
                                        {variant.name}
                                    </Text>
                                    {variant.is_default ? (
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                            Default
                                        </span>
                                    ) : null}
                                </div>
                                {variant.sku !== "" ? (
                                    <Text variant="xs" className="text-muted-foreground">
                                        SKU {variant.sku}
                                    </Text>
                                ) : null}
                            </div>
                            <Text variant="sm">{formatCurrency(variant.price)}</Text>
                            <Text variant="xs" className="text-muted-foreground">
                                {variant.status === "active" ? "Aktif" : "Nonaktif"}
                            </Text>
                            <div className="flex items-center justify-start gap-0.5 sm:justify-end">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    aria-label={`Jadikan default ${variant.name}`}
                                    disabled={variant.is_default}
                                    onClick={() => setDefault(variant.key)}
                                >
                                    <StarIcon />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    aria-label={`Naikkan ${variant.name}`}
                                    disabled={index === 0}
                                    onClick={() => move(index, -1)}
                                >
                                    <ArrowUpIcon />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    aria-label={`Turunkan ${variant.name}`}
                                    disabled={index === variants.length - 1}
                                    onClick={() => move(index, 1)}
                                >
                                    <ArrowDownIcon />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    aria-label={`Ubah ${variant.name}`}
                                    onClick={() => openEdit(variant)}
                                >
                                    <PencilIcon />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon-xs"
                                    aria-label={`Hapus ${variant.name}`}
                                    className="text-destructive"
                                    onClick={() => onChange(variants.filter((item) => item.key !== variant.key))}
                                >
                                    <Trash2Icon />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed px-4 py-6 text-center">
                    <Text variant="sm" className="text-muted-foreground">
                        Belum ada variant. Tambahkan minimal satu variant.
                    </Text>
                </div>
            )}

            <Button type="button" size="sm" variant="outline" className="self-start" onClick={openCreate}>
                <PlusIcon /> Tambah Variant
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader className="flex flex-col gap-0.5">
                        <DialogTitle className="text-lg font-semibold">
                            {editingKey === null ? "Tambah variant" : "Edit variant"}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            {editingKey === null
                                ? "Tambahkan variant sesuai yang anda inginkan"
                                : "edit variant sesuai yang anda inginkan"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                        <Field>
                            <FieldLabel htmlFor="draft-variant-name">Nama</FieldLabel>
                            <Input
                                id="draft-variant-name"
                                value={values.name}
                                onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
                                aria-invalid={errors.name !== undefined}
                                className="h-11"
                            />
                            {errors.name !== undefined ? <FieldError>{errors.name}</FieldError> : null}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="draft-variant-sku">SKU (opsional)</FieldLabel>
                            <Input
                                id="draft-variant-sku"
                                value={values.sku}
                                onChange={(event) => setValues((current) => ({ ...current, sku: event.target.value }))}
                                className="h-11"
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="draft-variant-price">Harga (Rp)</FieldLabel>
                            <Input
                                id="draft-variant-price"
                                inputMode="numeric"
                                value={String(values.price)}
                                onChange={(event) =>
                                    setValues((current) => ({ ...current, price: Number(event.target.value) }))
                                }
                                aria-invalid={errors.price !== undefined}
                                className="h-11"
                            />
                            {errors.price !== undefined ? <FieldError>{errors.price}</FieldError> : null}
                        </Field>
                        <div className="flex items-center justify-between gap-3 px-1 py-2.5">
                            <Text variant="sm" weight="semibold">
                                Variant utama
                            </Text>
                            <Switch
                                checked={values.is_default}
                                onCheckedChange={(checked) =>
                                    setValues((current) => ({ ...current, is_default: checked === true }))
                                }
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" size="lg" variant="outline" onClick={() => setDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit" size="lg">
                                Simpan
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export function GroupDraftEditor({
    groups,
    onChange,
}: {
    groups: GroupDraft[]
    onChange: (groups: GroupDraft[]) => void
}) {
    const [groupDialogOpen, setGroupDialogOpen] = useState(false)
    const [editingGroupKey, setEditingGroupKey] = useState<string | null>(null)
    const [groupValues, setGroupValues] = useState({
        name: "",
        description: "",
        selection_type: "single" as SelectionType,
        min_selection: 0,
        max_selection_raw: "" as number | "",
        is_required: false,
    })
    const [groupErrors, setGroupErrors] = useState<Record<string, string>>({})

    const [modifierDialog, setModifierDialog] = useState<{ open: boolean; groupKey: string; modifierKey?: string }>({
        open: false,
        groupKey: "",
    })
    const [modifierValues, setModifierValues] = useState({ name: "", description: "", price: 0, is_default: false })
    const [modifierErrors, setModifierErrors] = useState<Record<string, string>>({})

    function openCreateGroup() {
        setEditingGroupKey(null)
        setGroupValues({
            name: "",
            description: "",
            selection_type: "single",
            min_selection: 0,
            max_selection_raw: "",
            is_required: false,
        })
        setGroupErrors({})
        setGroupDialogOpen(true)
    }

    function openEditGroup(group: GroupDraft) {
        setEditingGroupKey(group.key)
        setGroupValues({
            name: group.name,
            description: group.description,
            selection_type: group.selection_type,
            min_selection: group.min_selection,
            max_selection_raw: group.max_selection ?? "",
            is_required: group.is_required,
        })
        setGroupErrors({})
        setGroupDialogOpen(true)
    }

    function handleGroupSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const parsed = modifierGroupSchema.safeParse(groupValues)

        if (!parsed.success) {
            setGroupErrors(collectIssues(parsed.error))
            return
        }

        const payload: Omit<GroupDraft, "key" | "status" | "modifiers"> = {
            name: parsed.data.name,
            description: parsed.data.description ?? "",
            selection_type: parsed.data.selection_type,
            min_selection: parsed.data.min_selection,
            max_selection: parsed.data.max_selection_raw === "" ? null : parsed.data.max_selection_raw,
            is_required: parsed.data.is_required,
        }

        if (editingGroupKey === null) {
            onChange([...groups, { key: draftKey("grp"), status: "active", modifiers: [], ...payload }])
        } else {
            onChange(
                groups.map((group) =>
                    group.key === editingGroupKey ? { ...group, ...payload, status: group.status } : group
                )
            )
        }

        setGroupDialogOpen(false)
    }

    function openCreateModifier(groupKey: string) {
        setModifierDialog({ open: true, groupKey })
        setModifierValues({ name: "", description: "", price: 0, is_default: false })
        setModifierErrors({})
    }

    function openEditModifier(groupKey: string, modifier: ModifierDraft) {
        setModifierDialog({ open: true, groupKey, modifierKey: modifier.key })
        setModifierValues({
            name: modifier.name,
            description: modifier.description,
            price: modifier.price,
            is_default: modifier.is_default,
        })
        setModifierErrors({})
    }

    function handleModifierSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const parsed = modifierSchema.safeParse(modifierValues)

        if (!parsed.success) {
            setModifierErrors(collectIssues(parsed.error))
            return
        }

        const { groupKey, modifierKey } = modifierDialog

        onChange(
            groups.map((group) => {
                if (group.key !== groupKey) {
                    return group
                }

                const payload: Omit<ModifierDraft, "key" | "status"> = {
                    name: parsed.data.name,
                    description: parsed.data.description ?? "",
                    price: parsed.data.price,
                    is_default: parsed.data.is_default,
                }

                if (modifierKey === undefined) {
                    return {
                        ...group,
                        modifiers: [...group.modifiers, { key: draftKey("mod"), status: "active", ...payload }],
                    }
                }

                return {
                    ...group,
                    modifiers: group.modifiers.map((modifier) =>
                        modifier.key === modifierKey ? { ...modifier, ...payload, status: modifier.status } : modifier
                    ),
                }
            })
        )

        setModifierDialog({ open: false, groupKey: "" })
    }

    if (groups.length === 0) {
        return (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed px-4 py-6">
                <Text variant="sm" className="text-muted-foreground">
                    Customization bersifat opsional. Tambahkan modifier group jika diperlukan.
                </Text>
                <Button type="button" size="sm" onClick={openCreateGroup}>
                    <PlusIcon /> Tambah Modifier Group
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-3">
            {groups.map((group) => (
                <div key={group.key} className="flex flex-col gap-2 rounded-xl border p-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-col gap-0.5">
                            <Text variant="sm" weight="semibold">
                                {group.name}
                            </Text>
                            <Text variant="xs" className="text-muted-foreground">
                                {(group.is_required ? "Wajib" : "Opsional") +
                                    " • " +
                                    (group.selection_type === "single" ? "Single" : "Multiple") +
                                    " • " +
                                    (group.max_selection != null
                                        ? `${group.max_selection} pilihan`
                                        : `${group.min_selection}+ pilihan`)}
                            </Text>
                        </div>
                        <div className="flex shrink-0 gap-0.5">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                aria-label={`Ubah ${group.name}`}
                                onClick={() => openEditGroup(group)}
                            >
                                <PencilIcon />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                aria-label={`Hapus ${group.name}`}
                                className="text-destructive"
                                onClick={() => onChange(groups.filter((item) => item.key !== group.key))}
                            >
                                <Trash2Icon />
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        {group.modifiers.map((modifier) => (
                            <div
                                key={modifier.key}
                                className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                            >
                                <div className="flex min-w-0 flex-col">
                                    <Text variant="sm" truncate>
                                        {modifier.name}
                                    </Text>
                                    <Text variant="xs" className="text-muted-foreground">
                                        + {formatCurrency(modifier.price)}
                                    </Text>
                                </div>
                                <div className="flex shrink-0 gap-0.5">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-xs"
                                        aria-label={`Ubah ${modifier.name}`}
                                        onClick={() => openEditModifier(group.key, modifier)}
                                    >
                                        <PencilIcon />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-xs"
                                        aria-label={`Hapus ${modifier.name}`}
                                        className="text-destructive"
                                        onClick={() =>
                                            onChange(
                                                groups.map((item) =>
                                                    item.key === group.key
                                                        ? {
                                                              ...item,
                                                              modifiers: item.modifiers.filter(
                                                                  (m) => m.key !== modifier.key
                                                              ),
                                                          }
                                                        : item
                                                )
                                            )
                                        }
                                    >
                                        <Trash2Icon />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="self-start"
                            onClick={() => openCreateModifier(group.key)}
                        >
                            <PlusIcon /> Tambah Modifier
                        </Button>
                    </div>
                </div>
            ))}

            <Button type="button" size="sm" variant="outline" className="self-start" onClick={openCreateGroup}>
                <PlusIcon /> Tambah Modifier Group
            </Button>

            <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingGroupKey === null ? "Tambah modifier group" : "Edit modifier group"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleGroupSubmit} className="flex flex-col gap-4" noValidate>
                        <Field>
                            <FieldLabel htmlFor="draft-group-name">Nama group</FieldLabel>
                            <Input
                                id="draft-group-name"
                                value={groupValues.name}
                                onChange={(event) =>
                                    setGroupValues((current) => ({ ...current, name: event.target.value }))
                                }
                                aria-invalid={groupErrors.name !== undefined}
                                className="h-11"
                            />
                            {groupErrors.name !== undefined ? <FieldError>{groupErrors.name}</FieldError> : null}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="draft-group-description">Deskripsi (opsional)</FieldLabel>
                            <Input
                                id="draft-group-description"
                                value={groupValues.description}
                                onChange={(event) =>
                                    setGroupValues((current) => ({ ...current, description: event.target.value }))
                                }
                                className="h-11"
                            />
                        </Field>
                        <Field>
                            <FieldLabel id="draft-group-selection">Tipe seleksi</FieldLabel>
                            <Select
                                value={groupValues.selection_type}
                                onValueChange={(value) =>
                                    setGroupValues((current) => ({
                                        ...current,
                                        selection_type: (value ?? "single") as SelectionType,
                                    }))
                                }
                            >
                                <SelectTrigger className="w-full" aria-labelledby="draft-group-selection">
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
                                <FieldLabel htmlFor="draft-group-min">Min</FieldLabel>
                                <Input
                                    id="draft-group-min"
                                    inputMode="numeric"
                                    value={String(groupValues.min_selection)}
                                    onChange={(event) =>
                                        setGroupValues((current) => ({
                                            ...current,
                                            min_selection: Number(event.target.value),
                                        }))
                                    }
                                    aria-invalid={groupErrors.min_selection !== undefined}
                                    className="h-11"
                                />
                                {groupErrors.min_selection !== undefined ? (
                                    <FieldError>{groupErrors.min_selection}</FieldError>
                                ) : null}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="draft-group-max">Max</FieldLabel>
                                <Input
                                    id="draft-group-max"
                                    inputMode="numeric"
                                    placeholder="Tidak dibatasi"
                                    value={
                                        groupValues.max_selection_raw === ""
                                            ? ""
                                            : String(groupValues.max_selection_raw)
                                    }
                                    onChange={(event) =>
                                        setGroupValues((current) => ({
                                            ...current,
                                            max_selection_raw:
                                                event.target.value === "" ? "" : Number(event.target.value),
                                        }))
                                    }
                                    aria-invalid={groupErrors.max_selection_raw !== undefined}
                                    className="h-11"
                                />
                                {groupErrors.max_selection_raw !== undefined ? (
                                    <FieldError>{groupErrors.max_selection_raw}</FieldError>
                                ) : null}
                            </Field>
                        </div>
                        <div className="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5">
                            <Text variant="sm" weight="medium">
                                Wajib dipilih
                            </Text>
                            <Switch
                                checked={groupValues.is_required}
                                onCheckedChange={(checked) =>
                                    setGroupValues((current) => ({ ...current, is_required: checked === true }))
                                }
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setGroupDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="submit">Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog
                open={modifierDialog.open}
                onOpenChange={(open) => setModifierDialog((current) => ({ ...current, open }))}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {modifierDialog.modifierKey === undefined ? "Tambah modifier" : "Edit modifier"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleModifierSubmit} className="flex flex-col gap-4" noValidate>
                        <Field>
                            <FieldLabel htmlFor="draft-modifier-name">Nama</FieldLabel>
                            <Input
                                id="draft-modifier-name"
                                value={modifierValues.name}
                                onChange={(event) =>
                                    setModifierValues((current) => ({ ...current, name: event.target.value }))
                                }
                                aria-invalid={modifierErrors.name !== undefined}
                                className="h-11"
                            />
                            {modifierErrors.name !== undefined ? <FieldError>{modifierErrors.name}</FieldError> : null}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="draft-modifier-price">Harga tambahan (Rp)</FieldLabel>
                            <Input
                                id="draft-modifier-price"
                                inputMode="numeric"
                                value={String(modifierValues.price)}
                                onChange={(event) =>
                                    setModifierValues((current) => ({ ...current, price: Number(event.target.value) }))
                                }
                                aria-invalid={modifierErrors.price !== undefined}
                                className="h-11"
                            />
                            {modifierErrors.price !== undefined ? (
                                <FieldError>{modifierErrors.price}</FieldError>
                            ) : null}
                        </Field>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setModifierDialog((c) => ({ ...c, open: false }))}
                            >
                                Batal
                            </Button>
                            <Button type="submit">Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export function MediaDraftPicker({
    media,
    onChange,
}: {
    media: MediaDraft[]
    onChange: (media: MediaDraft[]) => void
}) {
    function add() {
        const placeholder = pickMediaPlaceholder()

        onChange([
            ...media,
            {
                key: draftKey("med"),
                url: placeholder.url ?? "/images/catalog/placeholder-1.svg",
                alt_text: placeholder.alt_text ?? "",
                is_primary: media.length === 0,
            },
        ])
    }

    function setPrimary(key: string) {
        onChange(media.map((item) => ({ ...item, is_primary: item.key === key })))
    }

    function move(index: number, direction: -1 | 1) {
        const next = [...media]
        const target = index + direction

        if (target < 0 || target >= next.length) {
            return
        }

        const [item] = next.splice(index, 1)

        next.splice(target, 0, item)
        onChange(next)
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {media.map((item, index) => (
                    <div key={item.key} className="flex flex-col gap-1">
                        <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
                            <img src={item.url} alt={item.alt_text} className="size-full object-cover" />
                            {item.is_primary ? (
                                <span className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                                    <StarIcon aria-hidden="true" className="size-3" /> Utama
                                </span>
                            ) : null}
                            <div className="absolute inset-x-1 bottom-1 flex justify-center gap-1">
                                <Button
                                    type="button"
                                    size="icon-xs"
                                    variant="secondary"
                                    aria-label={`Foto utama ${index + 1}`}
                                    disabled={item.is_primary}
                                    onClick={() => setPrimary(item.key)}
                                >
                                    <StarIcon />
                                </Button>
                                <Button
                                    type="button"
                                    size="icon-xs"
                                    variant="secondary"
                                    aria-label={`Naikkan foto ${index + 1}`}
                                    disabled={index === 0}
                                    onClick={() => move(index, -1)}
                                >
                                    <ArrowUpIcon />
                                </Button>
                                <Button
                                    type="button"
                                    size="icon-xs"
                                    variant="secondary"
                                    aria-label={`Turunkan foto ${index + 1}`}
                                    disabled={index === media.length - 1}
                                    onClick={() => move(index, 1)}
                                >
                                    <ArrowDownIcon />
                                </Button>
                                <Button
                                    type="button"
                                    size="icon-xs"
                                    variant="destructive"
                                    aria-label={`Hapus foto ${index + 1}`}
                                    onClick={() => onChange(media.filter((entry) => entry.key !== item.key))}
                                >
                                    <Trash2Icon />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    onClick={add}
                    aria-label="Tambah foto"
                    className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                    <PlusIcon aria-hidden="true" className="size-5" />
                    <Text variant="xs">Tambah</Text>
                </button>
            </div>
            <Text variant="xs" className="text-muted-foreground">
                Mode dummy: foto menggunakan placeholder lokal, tanpa upload.
            </Text>
        </div>
    )
}

export function OutletDraftPicker({
    outlets,
    selectedIds,
    onChange,
}: {
    outlets: CatalogOutlet[]
    selectedIds: string[]
    onChange: (ids: string[]) => void
}) {
    return (
        <div className="flex flex-col gap-3">
            <Text variant="sm" weight="medium">
                Produk tersedia di:
            </Text>

            <div className="flex flex-col gap-2">
                {outlets.map((outlet) => {
                    const checked = selectedIds.includes(outlet.id)

                    return (
                        <label
                            key={outlet.id}
                            className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-3 hover:bg-muted/50"
                        >
                            <span className="flex min-w-0 flex-col">
                                <Text variant="sm" weight="medium">
                                    {outlet.name}
                                </Text>
                                <Text variant="xs" className="text-muted-foreground">
                                    {checked ? "Ditugaskan" : "Tidak ditugaskan"}
                                </Text>
                            </span>
                            <Checkbox
                                checked={checked}
                                onCheckedChange={(value) =>
                                    onChange(
                                        value === true
                                            ? [...selectedIds, outlet.id]
                                            : selectedIds.filter((id) => id !== outlet.id)
                                    )
                                }
                            />
                        </label>
                    )
                })}
            </div>
        </div>
    )
}

export function groupDraftFromResource(group: ProductModifierGroup): GroupDraft {
    return {
        key: group.id,
        name: group.name,
        description: group.description ?? "",
        selection_type: group.selection_type,
        min_selection: group.min_selection,
        max_selection: group.max_selection,
        is_required: group.is_required,
        status: group.status,
        modifiers: group.modifiers.map((modifier) => ({
            key: modifier.id,
            name: modifier.name,
            description: modifier.description ?? "",
            price: modifier.price,
            is_default: modifier.is_default,
            status: modifier.status,
        })),
    }
}

export function LabelRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-3 border-b py-2 last:border-b-0">
            <Label className="text-muted-foreground">{label}</Label>
            <span className="text-right text-sm font-medium">{children}</span>
        </div>
    )
}
