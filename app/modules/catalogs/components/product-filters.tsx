import { useState } from "react"
import { CircleCheck, PlusIcon, RotateCcw, SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react"
import { Link } from "react-router"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "~/components/ui/sheet"
import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"
import { CATALOGS_PATHS } from "../utils/paths"
import type { CatalogCategory, CatalogStatus, ProductType } from "../types/catalog.types"

export interface ProductFilterValues {
    search: string
    category_id: string
    status: "" | CatalogStatus
    product_type: "" | ProductType
}

const ALL = "all"

const STATUS_CHIPS = [
    { value: "", label: "Semua" },
    { value: "active", label: "Aktif" },
    { value: "inactive", label: "Nonaktif" },
] as const

function FilterFields({
    values,
    categories,
    onChange,
}: {
    values: ProductFilterValues
    categories: CatalogCategory[]
    onChange: (patch: Partial<ProductFilterValues>) => void
}) {
    return (
        <>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="filter-category">Kategori</Label>
                <Select
                    value={values.category_id === "" ? ALL : values.category_id}
                    onValueChange={(value) => onChange({ category_id: value === ALL || value == null ? "" : value })}
                >
                    <SelectTrigger id="filter-category" className="w-full">
                        <SelectValue placeholder="Semua kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>Semua kategori</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="filter-type">Tipe produk</Label>
                <Select
                    value={values.product_type === "" ? ALL : values.product_type}
                    onValueChange={(value) =>
                        onChange({ product_type: value === ALL || value == null ? "" : (value as ProductType) })
                    }
                >
                    <SelectTrigger id="filter-type" className="w-full">
                        <SelectValue placeholder="Semua tipe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>Semua tipe</SelectItem>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="variable">Variable</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </>
    )
}

export function ProductFilters({
    values,
    categories,
    count,
    onChange,
    onReset,
    hasFilters,
    reorderMode,
    canReorder,
    onToggleReorder,
}: {
    values: ProductFilterValues
    categories: CatalogCategory[]
    count?: number | null
    onChange: (patch: Partial<ProductFilterValues>) => void
    onReset: () => void
    hasFilters: boolean
    reorderMode: boolean
    canReorder: boolean
    onToggleReorder: () => void
}) {
    const [sheetOpen, setSheetOpen] = useState(false)

    const activeFacetCount = [values.category_id, values.product_type].filter((value) => value !== "").length

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <div className="relative min-w-0 flex-1">
                    <SearchIcon
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                        value={values.search}
                        onChange={(event) => onChange({ search: event.target.value })}
                        placeholder="Cari produk..."
                        aria-label="Cari produk"
                        className="h-10 pr-9 pl-9"
                    />
                    {values.search !== "" ? (
                        <button
                            type="button"
                            aria-label="Hapus pencarian"
                            onClick={() => onChange({ search: "" })}
                            className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                            <XIcon aria-hidden="true" className="size-3.5" />
                        </button>
                    ) : null}
                </div>

                <Button render={<Link to={CATALOGS_PATHS.new} />} size="lg" className="shrink-0">
                    <PlusIcon aria-hidden="true" />
                    <span className="hidden sm:inline">Tambah Produk</span>
                    <span className="sm:hidden">Tambah</span>
                </Button>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2">
                    <div
                        role="group"
                        aria-label="Filter status produk"
                        className="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto"
                    >
                        {STATUS_CHIPS.map((chip) => {
                            const active = values.status === chip.value

                            return (
                                <button
                                    key={chip.value === "" ? "all" : chip.value}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => onChange({ status: chip.value })}
                                    className={cn(
                                        "h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                                        active
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "bg-card text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {chip.label}
                                </button>
                            )
                        })}
                    </div>

                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger
                            render={
                                <Button
                                    type="button"
                                    variant={activeFacetCount > 0 ? "secondary" : "outline"}
                                    size="sm"
                                    className="h-10 shrink-0 gap-1.5 rounded-xl"
                                    aria-label="Filter produk"
                                />
                            }
                        >
                            <SlidersHorizontalIcon aria-hidden="true" />
                            <Text variant="xs" weight="medium">
                                Filter
                            </Text>
                            {activeFacetCount > 0 ? (
                                <>
                                    <span
                                        aria-hidden="true"
                                        className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground"
                                    >
                                        {activeFacetCount}
                                    </span>
                                    <span className="sr-only">{activeFacetCount} filter aktif</span>
                                </>
                            ) : null}
                        </SheetTrigger>
                        <SheetContent side="bottom" className="rounded-t-4xl md:mx-auto md:max-w-md">
                            <SheetHeader>
                                <SheetTitle className="text-lg font-bold">Filter produk</SheetTitle>
                                <SheetDescription className="text-xs">
                                    Saring daftar produk berdasarkan kategori dan tipe.
                                </SheetDescription>
                            </SheetHeader>
                            <div className="flex flex-col gap-4 px-4">
                                <FilterFields values={values} categories={categories} onChange={onChange} />
                            </div>
                            <SheetFooter className="flex-row">
                                <Button size="lg" type="button" variant="outline" className="flex-1" onClick={onReset}>
                                    <RotateCcw />
                                    Reset
                                </Button>
                                <Button size="lg" type="button" className="flex-1" onClick={() => setSheetOpen(false)}>
                                    <CircleCheck />
                                    Terapkan
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="flex items-center justify-between gap-3 lg:justify-end">
                    {count != null ? (
                        <Text variant="xs" className="text-muted-foreground">
                            Menampilkan {count} produk
                        </Text>
                    ) : (
                        <span aria-hidden="true" />
                    )}

                    <Button
                        type="button"
                        variant={reorderMode ? "secondary" : "outline"}
                        size="sm"
                        className="h-10 shrink-0"
                        disabled={!canReorder && !reorderMode}
                        onClick={onToggleReorder}
                        aria-pressed={reorderMode}
                    >
                        {reorderMode ? "Selesai" : "Urutkan"}
                    </Button>
                </div>
            </div>

            {reorderMode ? (
                <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                    Seret kartu untuk mengubah urutan tampil katalog.
                </p>
            ) : null}
        </div>
    )
}
