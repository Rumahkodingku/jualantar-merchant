import { useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, PencilIcon, PlusIcon, StarIcon, Trash2Icon } from "lucide-react"

import { Button } from "~/components/ui/button"
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
import { Switch } from "~/components/ui/switch"
import { Text } from "~/components/ui/text"

import { formatCurrency } from "../../utils/format-currency"
import { issuesToMessages } from "../../utils/issues"
import { variantRowSchema } from "../../schemas/catalog.schema"
import { draftKey } from "./utils"
import type { VariantDraft } from "./types"

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
            setErrors(issuesToMessages(parsed.error.issues))
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
