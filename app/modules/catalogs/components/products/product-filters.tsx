import { CircleCheck, PlusIcon, RotateCcw, SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react"
import { Link } from "react-router"
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
import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"
import { ProductFilterFields } from "./product-filter-fields"
import { CATALOGS_PATHS } from "../../utils/paths"
import type { ProductFilterValues } from "../../utils/product-filters"
import type { CatalogCategory } from "../../types"

const STATUS_CHIPS = [
    { value: "", label: "Semua" },
    { value: "active", label: "Aktif" },
    { value: "inactive", label: "Nonaktif" },
] as const

export function ProductFilters({
    values,
    categories,
    count,
    onChange,
    onReset,
    reorderMode,
    canReorder,
    onToggleReorder,
}: {
    values: ProductFilterValues
    categories: CatalogCategory[]
    count?: number | null
    onChange: (patch: Partial<ProductFilterValues>) => void
    onReset: () => void
    reorderMode: boolean
    canReorder: boolean
    onToggleReorder: () => void
}) {
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
                                    Saring daftar produk berdasarkan kategori dan tipe.
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
                                <ProductFilterFields values={values} categories={categories} onChange={onChange} />
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
