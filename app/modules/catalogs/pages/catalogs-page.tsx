import { useEffect, useMemo, useState } from "react"
import { SearchXIcon, ShoppingBagIcon } from "lucide-react"
import { Link, useSearchParams } from "react-router"
import { ErrorState } from "~/components/error-state"
import { Button } from "~/components/ui/button"
import { useDebouncedValue } from "~/hooks/use-debounced-value"
import { CatalogEmptyState } from "../components/catalog-empty-state"
import { ListSkeleton } from "../components/list-skeleton"
import { ProductFilters, type ProductFilterValues } from "../components/product-filters"
import { ProductList } from "../components/product-list"
import { useReorderProducts } from "../services/catalog.mutations"
import { useCategories, useProducts } from "../services/catalog.queries"
import { notifyError, notifySuccess } from "../utils/notify"
import { CATALOGS_PATHS } from "../utils/paths"
import type { CatalogStatus, ProductIndexParams, ProductType } from "../types/catalog.types"

function readFilters(searchParams: URLSearchParams): ProductFilterValues {
    const status = searchParams.get("status") ?? ""
    const productType = searchParams.get("product_type") ?? ""

    return {
        search: searchParams.get("q") ?? "",
        category_id: searchParams.get("category_id") ?? "",
        status: status === "active" || status === "inactive" ? status : "",
        product_type: productType === "simple" || productType === "variable" ? productType : "",
    }
}

export function CatalogsPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const filters = readFilters(searchParams)

    const [searchInput, setSearchInput] = useState(filters.search)
    const debouncedSearch = useDebouncedValue(searchInput, 300)
    const [reorderMode, setReorderMode] = useState(false)

    useEffect(() => {
        setSearchInput(filters.search)
    }, [filters.search])

    useEffect(() => {
        if (debouncedSearch === (searchParams.get("q") ?? "")) {
            return
        }

        const next = new URLSearchParams(searchParams)

        if (debouncedSearch.trim() === "") {
            next.delete("q")
        } else {
            next.set("q", debouncedSearch)
        }

        setSearchParams(next, { replace: true })
    }, [debouncedSearch, searchParams, setSearchParams])

    const hasFilters =
        filters.search !== "" || filters.category_id !== "" || filters.status !== "" || filters.product_type !== ""

    const params = useMemo<ProductIndexParams>(
        () => ({
            search: filters.search !== "" ? filters.search : undefined,
            category_id: filters.category_id !== "" ? filters.category_id : undefined,
            status: filters.status !== "" ? (filters.status as CatalogStatus) : undefined,
            product_type: filters.product_type !== "" ? (filters.product_type as ProductType) : undefined,
            sort: "display_order",
            order: "asc",
        }),
        [filters.search, filters.category_id, filters.status, filters.product_type]
    )

    const productsQuery = useProducts(params)
    const categoriesQuery = useCategories({ per_page: 100 })
    const reorderMutation = useReorderProducts()

    const categories = categoriesQuery.data?.data ?? []
    const categoryNameById = useMemo(
        () => Object.fromEntries(categories.map((category) => [category.id, category.name])),
        [categories]
    )

    function patchFilters(patch: Partial<ProductFilterValues>) {
        setReorderMode(false)

        if (patch.search !== undefined) {
            setSearchInput(patch.search)
            return
        }

        const next = new URLSearchParams(searchParams)

        for (const [key, value] of Object.entries(patch)) {
            if (value === "" || value === undefined) {
                next.delete(key)
            } else {
                next.set(key, String(value))
            }
        }

        setSearchParams(next, { replace: true })
    }

    function resetFilters() {
        setSearchInput("")
        setReorderMode(false)
        setSearchParams(new URLSearchParams(), { replace: true })
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

    const productCount = productsQuery.data?.meta.total ?? null

    return (
        <>
            <ProductFilters
                values={{ ...filters, search: searchInput }}
                categories={categories}
                count={productCount}
                onChange={patchFilters}
                onReset={resetFilters}
                hasFilters={hasFilters}
                reorderMode={reorderMode}
                canReorder={!hasFilters}
                onToggleReorder={() => setReorderMode((mode) => !mode)}
            />

            {productsQuery.isPending ? (
                <ListSkeleton rows={4} className="h-72 md:h-64" layout="grid" />
            ) : productsQuery.isError ? (
                <ErrorState
                    title="Gagal memuat produk"
                    description="Terjadi kesalahan saat memuat daftar produk."
                    onRetry={() => void productsQuery.refetch()}
                />
            ) : productsQuery.data.data.length === 0 ? (
                hasFilters ? (
                    <CatalogEmptyState
                        icon={SearchXIcon}
                        title="Produk tidak ditemukan"
                        description="Coba ubah kata pencarian atau filter Anda."
                        action={
                            <Button type="button" variant="outline" onClick={resetFilters}>
                                Reset filter
                            </Button>
                        }
                    />
                ) : (
                    <CatalogEmptyState
                        icon={ShoppingBagIcon}
                        title="Belum ada produk"
                        description="Tambahkan produk pertama Anda agar pelanggan dapat mulai memesan."
                        action={
                            <Button render={<Link to={CATALOGS_PATHS.new} />}>
                                <ShoppingBagIcon aria-hidden="true" /> Tambah Produk
                            </Button>
                        }
                    />
                )
            ) : (
                <ProductList
                    products={productsQuery.data.data}
                    categoryNameById={categoryNameById}
                    reorderMode={reorderMode && !hasFilters}
                    onReorder={handleReorder}
                />
            )}
        </>
    )
}
