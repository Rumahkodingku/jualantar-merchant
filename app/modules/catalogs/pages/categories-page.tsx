import { useEffect, useState } from "react"
import { FolderPlusIcon, SearchXIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { ErrorState } from "~/components/error-state"
import { Input } from "~/components/ui/input"
import { useDebouncedValue } from "~/hooks/use-debounced-value"

import { CatalogEmptyState } from "../components/catalog-empty-state"
import { ListSkeleton } from "~/components/list-skeleton"
import { CategoryDeleteDialog } from "../components/categories/category-delete-dialog"
import { CategoryFormDialog } from "../components/categories/category-form-dialog"
import { CategoryList } from "../components/categories/category-list"
import { CategoryStatusDialog } from "../components/categories/category-status-dialog"
import type { CategoryRowAction } from "../components/categories/category-row"
import {
    useDeleteCategory,
    useReorderCategories,
    useSetCategoryStatus,
} from "../services/categories/category.mutations"
import { useCategories } from "../services/categories/category.queries"
import { catalogErrorMessage } from "../utils/api-error"
import { notifyError, notifySuccess } from "~/lib/notify"
import type { CatalogCategory, CatalogStatus } from "../types/catalog.types"

type ConfirmAction = { kind: "status" | "delete"; category: CatalogCategory } | null

export function CatalogCategoriesPage() {
    const [searchInput, setSearchInput] = useState("")
    const debouncedSearch = useDebouncedValue(searchInput, 300)
    const [reorderMode, setReorderMode] = useState(false)
    const [dialog, setDialog] = useState<{ open: boolean; category?: CatalogCategory }>({ open: false })
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

    function handleRowAction(category: CatalogCategory, action: CategoryRowAction) {
        if (action === "edit") {
            setDialog({ open: true, category })
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
            onError: (error) => notifyError(catalogErrorMessage(error, "Gagal memperbarui status")),
        })
    }

    function runDelete(category: CatalogCategory) {
        deleteMutation.mutate(category.id, {
            onSuccess: () => {
                setConfirm(null)
                notifySuccess("Kategori dihapus", `"${category.name}" dihapus.`)
            },
            onError: (error) => notifyError(catalogErrorMessage(error, "Gagal menghapus kategori")),
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

                    <Button type="button" size="sm" className="h-10 shrink-0" onClick={() => setDialog({ open: true })}>
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
                            <Button type="button" onClick={() => setDialog({ open: true })}>
                                <FolderPlusIcon aria-hidden="true" /> Tambah Kategori
                            </Button>
                        }
                    />
                )
            ) : (
                <CategoryList
                    categories={categories}
                    reorderMode={reorderMode}
                    hasSearch={hasSearch}
                    onAction={handleRowAction}
                    onReorder={handleReorder}
                />
            )}

            {dialog.open ? (
                <CategoryFormDialog category={dialog.category} onClose={() => setDialog({ open: false })} />
            ) : null}

            <CategoryStatusDialog
                category={confirm?.kind === "status" ? confirm.category : null}
                isPending={isConfirmPending}
                onClose={() => setConfirm(null)}
                onConfirm={() => confirm?.kind === "status" && runStatus(confirm.category)}
            />

            <CategoryDeleteDialog
                category={confirm?.kind === "delete" ? confirm.category : null}
                isPending={isConfirmPending}
                onClose={() => setConfirm(null)}
                onConfirm={() => confirm?.kind === "delete" && runDelete(confirm.category)}
            />
        </>
    )
}
