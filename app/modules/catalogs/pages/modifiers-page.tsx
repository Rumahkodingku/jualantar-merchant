import { useState } from "react"
import { BoxesIcon } from "lucide-react"

import { ErrorState } from "~/components/error-state"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Skeleton } from "~/components/ui/skeleton"
import { Text } from "~/components/ui/text"

import { CatalogEmptyState } from "../components/catalog-empty-state"
import { ListSkeleton } from "../components/list-skeleton"
import { ModifierEditor } from "../components/modifier-editor"
import { StatusBadge } from "../components/status-badge"
import { useProductDetail, useProducts } from "../services/catalog.queries"
import { formatCurrency } from "../utils/format-currency"
import { SELECTION_TYPE_LABEL } from "../utils/labels"

const EMPTY = "none"

function GroupSummaryCard({
    group,
}: {
    group: {
        id: string
        name: string
        status: "active" | "inactive"
        selection_type: "single" | "multiple"
        is_required: boolean
        min_selection: number
        max_selection: number | null
        modifiers: Array<{ id: string; name: string; price: number }>
    }
}) {
    return (
        <div className="flex flex-col gap-2 rounded-2xl border bg-card p-4 ring-1 ring-foreground/5">
            <div className="flex items-center justify-between gap-2">
                <Text variant="sm" weight="semibold" truncate>
                    {group.name}
                </Text>
                <StatusBadge status={group.status} />
            </div>
            <Text variant="xs" className="text-muted-foreground">
                {(group.is_required ? "Wajib" : "Opsional") +
                    " • " +
                    SELECTION_TYPE_LABEL[group.selection_type] +
                    " • " +
                    (group.max_selection != null
                        ? `${group.max_selection} pilihan`
                        : `${group.min_selection}+ pilihan`)}
            </Text>
            <ul className="flex flex-col gap-1.5 border-t pt-2">
                {group.modifiers.length === 0 ? (
                    <li>
                        <Text variant="xs" className="text-muted-foreground">
                            Belum ada modifier.
                        </Text>
                    </li>
                ) : (
                    group.modifiers.map((modifier) => (
                        <li key={modifier.id} className="flex items-center justify-between gap-3">
                            <Text variant="sm" truncate>
                                {modifier.name}
                            </Text>
                            <Text variant="sm" className="shrink-0">
                                {formatCurrency(modifier.price)}
                            </Text>
                        </li>
                    ))
                )}
            </ul>
        </div>
    )
}

export function CatalogModifiersPage() {
    const [selectedId, setSelectedId] = useState<string>(EMPTY)
    const [editing, setEditing] = useState(false)

    const productsQuery = useProducts({ per_page: 100, sort: "name", order: "asc" })
    const detailQuery = useProductDetail(selectedId === EMPTY ? undefined : selectedId)

    const products = productsQuery.data?.data ?? []
    const product = detailQuery.data

    function handleValueChange(value: string | null) {
        setSelectedId(value ?? EMPTY)
        setEditing(false)
    }

    if (productsQuery.isPending) {
        return <ListSkeleton rows={4} className="h-20" />
    }

    if (productsQuery.isError) {
        return (
            <ErrorState
                title="Gagal memuat produk"
                description="Terjadi kesalahan saat memuat daftar produk."
                onRetry={() => void productsQuery.refetch()}
            />
        )
    }

    if (products.length === 0) {
        return (
            <CatalogEmptyState
                icon={BoxesIcon}
                title="Belum ada produk"
                description="Tambahkan produk terlebih dahulu untuk mengelola modifier."
            />
        )
    }

    if (selectedId === EMPTY) {
        return (
            <>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="modifier-product">Pilih Product</Label>
                    <Select value={selectedId} onValueChange={handleValueChange}>
                        <SelectTrigger id="modifier-product" className="w-full">
                            <SelectValue placeholder="Pilih product" />
                        </SelectTrigger>
                        <SelectContent>
                            {products.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                    {item.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <CatalogEmptyState
                    icon={BoxesIcon}
                    title="Pilih product"
                    description="Modifier group melekat pada product. Pilih product untuk melihat dan mengelola modifier."
                />
            </>
        )
    }

    return (
        <>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="modifier-product">Pilih Product</Label>
                <Select value={selectedId} onValueChange={handleValueChange}>
                    <SelectTrigger id="modifier-product" className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {products.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                                {item.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {detailQuery.isPending ? (
                <Skeleton className="h-40 w-full rounded-2xl" />
            ) : detailQuery.isError || product === undefined ? (
                <ErrorState
                    title="Gagal memuat product"
                    description="Terjadi kesalahan saat memuat modifier product."
                    onRetry={() => void detailQuery.refetch()}
                />
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 flex-col">
                            <Text variant="base" weight="semibold" truncate>
                                {product.name}
                            </Text>
                            <Text variant="xs" className="text-muted-foreground">
                                {(product.modifier_groups ?? []).length} modifier group
                            </Text>
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            variant={editing ? "secondary" : "outline"}
                            onClick={() => setEditing((mode) => !mode)}
                        >
                            {editing ? "Selesai" : "Kelola"}
                        </Button>
                    </div>

                    {editing ? (
                        <ModifierEditor productId={product.id} groups={product.modifier_groups ?? []} />
                    ) : (product.modifier_groups ?? []).length === 0 ? (
                        <CatalogEmptyState
                            icon={BoxesIcon}
                            title="Belum ada modifier group"
                            description="Buat modifier group untuk memberi pilihan tambahan pada product ini."
                            action={
                                <Button type="button" onClick={() => setEditing(true)}>
                                    Tambah Modifier Group
                                </Button>
                            }
                        />
                    ) : (
                        <div className="flex flex-col gap-3">
                            {(product.modifier_groups ?? []).map((group) => (
                                <GroupSummaryCard key={group.id} group={group} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
