import { useState } from "react"
import { ArrowDownIcon, ArrowUpIcon, PencilIcon, PlusIcon, StarIcon, Trash2Icon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import { VariantFormDialog, type FormMode, type VariantPayloadWithStatus } from "../variants/variant-form-dialog"
import { formatCurrency } from "../../utils/format-currency"
import { draftKey } from "../../utils/draft-key"
import type { VariantDraft } from "../../types/product-draft.types"

export function VariantDraftEditor({
    variants,
    onChange,
    mode = "draft",
}: {
    variants: VariantDraft[]
    onChange: (variants: VariantDraft[]) => void
    mode?: FormMode
}) {
    const [dialog, setDialog] = useState<{ open: boolean; key: string | null }>({ open: false, key: null })

    const editing = variants.find((variant) => variant.key === dialog.key)

    function openCreate() {
        setDialog({ open: true, key: null })
    }

    function openEdit(variant: VariantDraft) {
        setDialog({ open: true, key: variant.key })
    }

    function handleSubmit(payload: VariantPayloadWithStatus) {
        const base: Omit<VariantDraft, "key" | "status"> = {
            name: payload.name,
            sku: payload.sku ?? "",
            price: payload.price,
            is_default: payload.is_default,
        }

        if (dialog.key === null) {
            onChange([...variants, { key: draftKey("var"), status: payload.status, ...base }])
        } else {
            onChange(
                variants.map((variant) =>
                    variant.key === dialog.key ? { ...variant, ...base, status: payload.status } : variant
                )
            )
        }

        setDialog({ open: false, key: null })
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
                    <div className="hidden grid-cols-[1fr_auto_auto_auto] gap-8 border-b bg-muted/50 px-3 py-4 text-xs font-medium text-muted-foreground sm:grid">
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
                                    <Text variant="sm" weight="semibold" truncate>
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

            <Button type="button" size="lg" variant="outline" className="w-full self-start" onClick={openCreate}>
                <PlusIcon /> Tambah Variant
            </Button>

            {dialog.open ? (
                <VariantFormDialog
                    mode={mode}
                    variant={editing}
                    onClose={() => setDialog({ open: false, key: null })}
                    onSubmit={handleSubmit}
                />
            ) : null}
        </div>
    )
}
