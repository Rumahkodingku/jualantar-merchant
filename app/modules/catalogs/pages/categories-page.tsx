import { useEffect, useState } from "react"
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
    FolderPlusIcon,
    GripVerticalIcon,
    MoreVerticalIcon,
    PencilIcon,
    PowerIcon,
    SearchXIcon,
    Trash2Icon,
} from "lucide-react"

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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { ErrorState } from "~/components/error-state"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"
import { Textarea } from "~/components/ui/textarea"
import { useDebouncedValue } from "~/hooks/use-debounced-value"
import { cn } from "~/lib/utils"

import { CatalogEmptyState } from "../components/catalog-empty-state"
import { ListSkeleton } from "../components/list-skeleton"
import { StatusBadge } from "../components/status-badge"
import {
    useCreateCategory,
    useDeleteCategory,
    useReorderCategories,
    useSetCategoryStatus,
    useUpdateCategory,
} from "../services/catalog.mutations"
import { useCategories } from "../services/catalog.queries"
import { categorySchema, type CategoryFormValues } from "../schemas/catalog.schema"
import { notifyError, notifySuccess } from "../utils/notify"
import type { CatalogCategory, CatalogStatus } from "../types/catalog.types"

type ConfirmAction =
    { kind: "status"; category: CatalogCategory } | { kind: "delete"; category: CatalogCategory } | null

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

function CategoryDialog({
    open,
    onOpenChange,
    category,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    category?: CatalogCategory
}) {
    const createMutation = useCreateCategory()
    const updateMutation = useUpdateCategory(category?.id ?? "")
    const [values, setValues] = useState<CategoryFormValues>({ name: "", description: "" })
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        if (open) {
            setValues({ name: category?.name ?? "", description: category?.description ?? "" })
            setErrors({})
        }
    }, [open, category])

    const isPending = createMutation.isPending || updateMutation.isPending

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const parsed = categorySchema.safeParse(values)

        if (!parsed.success) {
            setErrors(issuesToMessages(parsed.error.issues))
            return
        }

        setErrors({})

        const onSuccess = () => {
            notifySuccess(category === undefined ? "Kategori dibuat" : "Kategori diperbarui")
            onOpenChange(false)
        }

        if (category === undefined) {
            createMutation.mutate(
                { name: parsed.data.name, description: parsed.data.description ?? null },
                { onSuccess, onError: () => notifyError("Gagal membuat kategori") }
            )
        } else {
            updateMutation.mutate(
                { name: parsed.data.name, description: parsed.data.description ?? null },
                { onSuccess, onError: () => notifyError("Gagal memperbarui kategori") }
            )
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{category === undefined ? "Tambah kategori" : "Edit kategori"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                    <Field>
                        <FieldLabel htmlFor="category-name">Nama kategori</FieldLabel>
                        <Input
                            id="category-name"
                            value={values.name}
                            onChange={(event) => {
                                setValues((current) => ({ ...current, name: event.target.value }))
                                setErrors({})
                            }}
                            placeholder="cth. Makanan"
                            aria-invalid={errors.name !== undefined}
                            className="h-11"
                        />
                        {errors.name !== undefined ? <FieldError>{errors.name}</FieldError> : null}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="category-description">Deskripsi (opsional)</FieldLabel>
                        <Textarea
                            id="category-description"
                            value={values.description ?? ""}
                            onChange={(event) =>
                                setValues((current) => ({ ...current, description: event.target.value }))
                            }
                            rows={3}
                        />
                    </Field>

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

function CategoryRow({
    category,
    reorderMode,
    onAction,
}: {
    category: CatalogCategory
    reorderMode: boolean
    onAction: (action: "edit" | "status" | "delete") => void
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: category.id,
        disabled: !reorderMode,
    })

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={cn(
                "flex items-center gap-2 rounded-2xl border bg-card px-3 py-3 ring-1 ring-foreground/5",
                isDragging && "relative z-10 opacity-70"
            )}
            {...attributes}
        >
            {reorderMode ? (
                <button
                    type="button"
                    aria-label={`Seret ${category.name} untuk mengurutkan`}
                    className="flex w-6 shrink-0 cursor-grab items-center justify-center text-muted-foreground active:cursor-grabbing"
                    {...listeners}
                >
                    <GripVerticalIcon aria-hidden="true" className="size-4" />
                </button>
            ) : null}

            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Text variant="sm" weight="medium" truncate>
                    {category.name}
                </Text>
                {category.description != null && category.description !== "" ? (
                    <Text variant="xs" className="truncate text-muted-foreground">
                        {category.description}
                    </Text>
                ) : null}
            </div>

            <StatusBadge status={category.status} className="shrink-0" />

            {!reorderMode ? (
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Aksi untuk ${category.name}`}
                            />
                        }
                    >
                        <MoreVerticalIcon />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onAction("edit")}>
                            <PencilIcon /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onAction("status")}>
                            <PowerIcon /> {category.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => onAction("delete")}>
                            <Trash2Icon /> Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : null}
        </div>
    )
}

export function CatalogCategoriesPage() {
    const [searchInput, setSearchInput] = useState("")
    const debouncedSearch = useDebouncedValue(searchInput, 300)
    const [reorderMode, setReorderMode] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<CatalogCategory | undefined>(undefined)
    const [confirm, setConfirm] = useState<ConfirmAction>(null)

    useEffect(() => {
        if (debouncedSearch.trim() !== "") {
            setReorderMode(false)
        }
    }, [debouncedSearch])

    const categoriesQuery = useCategories({
        search: debouncedSearch.trim() === "" ? undefined : debouncedSearch.trim(),
        per_page: 100,
        sort: "display_order",
        order: "asc",
    })
    const reorderMutation = useReorderCategories()
    const deleteMutation = useDeleteCategory()
    const statusMutation = useSetCategoryStatus(confirm?.kind === "status" ? confirm.category.id : "")

    const categories = categoriesQuery.data?.data ?? []
    const hasSearch = debouncedSearch.trim() !== ""
    const isConfirmPending = deleteMutation.isPending || statusMutation.isPending

    function openCreate() {
        setEditingCategory(undefined)
        setDialogOpen(true)
    }

    function openEdit(category: CatalogCategory) {
        setEditingCategory(category)
        setDialogOpen(true)
    }

    function handleRowAction(category: CatalogCategory, action: "edit" | "status" | "delete") {
        if (action === "edit") {
            openEdit(category)
            return
        }

        setConfirm({ kind: action, category })
    }

    function runStatus(category: CatalogCategory) {
        const nextStatus: CatalogStatus = category.status === "active" ? "inactive" : "active"

        statusMutation.mutate(nextStatus, {
            onSuccess: () => {
                setConfirm(null)
                notifySuccess(nextStatus === "active" ? "Kategori diaktifkan" : "Kategori dinonaktifkan")
            },
            onError: () => notifyError("Gagal memperbarui status"),
        })
    }

    function runDelete(category: CatalogCategory) {
        deleteMutation.mutate(category.id, {
            onSuccess: () => {
                setConfirm(null)
                notifySuccess("Kategori dihapus", `"${category.name}" dihapus.`)
            },
            onError: () => notifyError("Gagal menghapus kategori"),
        })
    }

    function handleReorder(orderedIds: string[]) {
        reorderMutation.mutate(
            orderedIds.map((id, index) => ({ id, display_order: index })),
            {
                onSuccess: () => notifySuccess("Urutan diperbarui"),
                onError: () => notifyError("Gagal memperbarui urutan"),
            }
        )
    }

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

    function handleDragEnd(event: DragEndEvent) {
        if (!reorderMode) {
            return
        }

        const { active, over } = event

        if (over == null || active.id === over.id) {
            return
        }

        const ids = categories.map((category) => category.id)
        const oldIndex = ids.indexOf(String(active.id))
        const newIndex = ids.indexOf(String(over.id))

        if (oldIndex < 0 || newIndex < 0) {
            return
        }

        handleReorder(arrayMove(ids, oldIndex, newIndex))
    }

    return (
        <>
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <Input
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Cari kategori..."
                        aria-label="Cari kategori"
                        className="h-10 flex-1"
                    />

                    <Button
                        type="button"
                        variant={reorderMode ? "secondary" : "outline"}
                        size="sm"
                        className="h-10 shrink-0"
                        disabled={hasSearch && !reorderMode}
                        onClick={() => setReorderMode((mode) => !mode)}
                        aria-pressed={reorderMode}
                    >
                        {reorderMode ? "Selesai" : "Urutkan"}
                    </Button>

                    <Button type="button" size="sm" className="h-10 shrink-0" onClick={openCreate}>
                        <FolderPlusIcon aria-hidden="true" />
                        <span className="hidden sm:inline">Tambah Kategori</span>
                        <span className="sm:hidden">Tambah</span>
                    </Button>
                </div>

                {hasSearch ? (
                    <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                        Urutkan dinonaktifkan saat pencarian aktif.
                    </p>
                ) : reorderMode ? (
                    <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                        Seret baris untuk mengubah urutan kategori.
                    </p>
                ) : null}
            </div>

            {categoriesQuery.isPending ? (
                <ListSkeleton rows={4} className="h-16" />
            ) : categoriesQuery.isError ? (
                <ErrorState
                    title="Gagal memuat kategori"
                    description="Terjadi kesalahan saat memuat daftar kategori."
                    onRetry={() => void categoriesQuery.refetch()}
                />
            ) : categories.length === 0 ? (
                hasSearch ? (
                    <CatalogEmptyState
                        icon={SearchXIcon}
                        title="Kategori tidak ditemukan"
                        description="Coba ubah kata pencarian Anda."
                    />
                ) : (
                    <CatalogEmptyState
                        icon={FolderPlusIcon}
                        title="Belum ada kategori"
                        description="Tambahkan kategori untuk mengelompokkan produk Anda."
                        action={
                            <Button type="button" onClick={openCreate}>
                                <FolderPlusIcon aria-hidden="true" /> Tambah Kategori
                            </Button>
                        }
                    />
                )
            ) : reorderMode && !hasSearch ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext
                        items={categories.map((category) => category.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="flex flex-col gap-2">
                            {categories.map((category) => (
                                <CategoryRow
                                    key={category.id}
                                    category={category}
                                    reorderMode
                                    onAction={() => undefined}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            ) : (
                <div className="flex flex-col gap-2">
                    {categories.map((category) => (
                        <CategoryRow
                            key={category.id}
                            category={category}
                            reorderMode={false}
                            onAction={(action) => handleRowAction(category, action)}
                        />
                    ))}
                </div>
            )}

            <CategoryDialog open={dialogOpen} onOpenChange={setDialogOpen} category={editingCategory} />

            <AlertDialog
                open={confirm?.kind === "status"}
                onOpenChange={(open) => (!open ? setConfirm(null) : undefined)}
            >
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirm?.category.status === "active" ? "Nonaktifkan kategori?" : "Aktifkan kategori?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirm?.category.status === "active"
                                ? `Kategori "${confirm.category.name}" tidak akan aktif pada katalog.`
                                : `Kategori "${confirm?.category.name ?? ""}" akan tampil aktif pada katalog.`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <Button
                            type="button"
                            variant={confirm?.category.status === "active" ? "destructive" : "default"}
                            disabled={isConfirmPending}
                            onClick={() => confirm?.kind === "status" && runStatus(confirm.category)}
                        >
                            {isConfirmPending ? (
                                <>
                                    <Spinner /> Memproses…
                                </>
                            ) : confirm?.category.status === "active" ? (
                                "Nonaktifkan"
                            ) : (
                                "Aktifkan"
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={confirm?.kind === "delete"}
                onOpenChange={(open) => (!open ? setConfirm(null) : undefined)}
            >
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus kategori?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Kategori &ldquo;{confirm?.category.name ?? ""}&rdquo; akan dihapus dari katalog.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isConfirmPending}
                            onClick={() => confirm?.kind === "delete" && runDelete(confirm.category)}
                        >
                            {isConfirmPending ? (
                                <>
                                    <Spinner /> Memproses…
                                </>
                            ) : (
                                "Hapus"
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
