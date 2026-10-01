import { CircleCheck, RotateCcw, SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react"
import {
    BottomSheet,
    BottomSheetBody,
    BottomSheetClose,
    BottomSheetContent,
    BottomSheetDescription,
    BottomSheetFooter,
    BottomSheetHeader,
    BottomSheetTitle,
    BottomSheetTrigger,
} from "~/components/ui/bottom-sheet"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

import type { OutletCatalogFilterValues } from "../../utils/outlet-catalog"
import type { CatalogCategory } from "../../types"

const ALL = "all"

const STATUS_CHIPS = [
    { value: "", label: "Semua" },
    { value: "active", label: "Aktif" },
    { value: "inactive", label: "Nonaktif" },
] as const

/**
 * Outlet catalog filters: search, status, category and availability. There is
 * deliberately no "Tambah Produk" action here — that belongs to the master
 * catalog and is owner-only.
 */
export function OutletProductFilters({
    values,
    categories,
    count,
    onChange,
    onReset,
    reorderMode,
    canReorder,
    onToggleReorder,
}: {
    values: OutletCatalogFilterValues
    categories: CatalogCategory[]
    count?: number | null
    onChange: (patch: Partial<OutletCatalogFilterValues>) => void
    onReset: () => void
    reorderMode: boolean
    canReorder: boolean
    onToggleReorder: () => void
}) {
    const activeFacetCount = [values.category_id, values.availability].filter((value) => value !== "").length

    const categoryItems = [
        { value: ALL, label: "Semua kategori" },
        ...categories.map((category) => ({ value: category.id, label: category.name })),
    ]

    const availabilityItems = [
        { value: ALL, label: "Semua ketersediaan" },
        { value: "available", label: "Tersedia" },
        { value: "unavailable", label: "Tidak tersedia" },
    ]

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

                    <BottomSheet>
                        <BottomSheetTrigger
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
                        </BottomSheetTrigger>
                        <BottomSheetContent className="rounded-t-4xl">
                            <BottomSheetHeader>
                                <BottomSheetTitle>Filter produk</BottomSheetTitle>
                                <BottomSheetDescription>
                                    Saring daftar produk outlet berdasarkan kategori dan ketersediaan.
                                </BottomSheetDescription>
                                <BottomSheetClose
                                    render={
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-sm"
                                            className="absolute top-3 right-3 hidden md:inline-flex"
                                            aria-label="Tutup filter produk"
                                        />
                                    }
                                >
                                    <XIcon aria-hidden="true" />
                                </BottomSheetClose>
                            </BottomSheetHeader>
                            <BottomSheetBody className="gap-5 px-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="outlet-filter-category" className="font-semibold">
                                        Kategori
                                    </Label>
                                    <Select
                                        items={categoryItems}
                                        value={values.category_id === "" ? ALL : values.category_id}
                                        onValueChange={(value) =>
                                            onChange({ category_id: value === ALL || value == null ? "" : value })
                                        }
                                    >
                                        <SelectTrigger id="outlet-filter-category" className="w-full">
                                            <SelectValue placeholder="Semua kategori" />
                                        </SelectTrigger>
                                        <SelectContent className="p-2">
                                            {categoryItems.map((category) => (
                                                <SelectItem
                                                    className="py-3"
                                                    key={category.value}
                                                    value={category.value}
                                                >
                                                    {category.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="outlet-filter-availability" className="font-semibold">
                                        Ketersediaan
                                    </Label>
                                    <Select
                                        items={availabilityItems}
                                        value={values.availability === "" ? ALL : values.availability}
                                        onValueChange={(value) =>
                                            onChange({
                                                availability:
                                                    value === ALL || value == null
                                                        ? ""
                                                        : (value as OutletCatalogFilterValues["availability"]),
                                            })
                                        }
                                    >
                                        <SelectTrigger id="outlet-filter-availability" className="w-full">
                                            <SelectValue placeholder="Semua ketersediaan" />
                                        </SelectTrigger>
                                        <SelectContent className="p-2">
                                            {availabilityItems.map((option) => (
                                                <SelectItem className="py-3" key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </BottomSheetBody>
                            <BottomSheetFooter className="mt-4 flex-row">
                                <Button size="lg" type="button" variant="outline" className="flex-1" onClick={onReset}>
                                    <RotateCcw />
                                    Reset
                                </Button>
                                <BottomSheetClose render={<Button size="lg" type="button" className="flex-1" />}>
                                    <CircleCheck />
                                    Terapkan
                                </BottomSheetClose>
                            </BottomSheetFooter>
                        </BottomSheetContent>
                    </BottomSheet>
                </div>

                {canReorder ? (
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
                            onClick={onToggleReorder}
                            aria-pressed={reorderMode}
                        >
                            {reorderMode ? "Selesai" : "Urutkan"}
                        </Button>
                    </div>
                ) : count != null ? (
                    <Text variant="xs" className="text-muted-foreground">
                        Menampilkan {count} produk
                    </Text>
                ) : null}
            </div>

            {reorderMode ? (
                <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                    Seret kartu untuk mengubah urutan tampil katalog outlet.
                </p>
            ) : null}
        </div>
    )
}
