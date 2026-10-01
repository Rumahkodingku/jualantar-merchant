import { useEffect, useMemo, useState } from "react"
import { SearchXIcon, ShoppingBagIcon, StoreIcon } from "lucide-react"

import { ErrorState } from "~/components/error-state"
import { ForbiddenState } from "~/components/forbidden-state"
import { Button } from "~/components/ui/button"
import { useDebouncedValue } from "~/hooks/use-debounced-value"
import { useStableSearchParams } from "~/hooks/use-stable-search-params"
import { CAP, useOutletAuthorization } from "~/modules/authorization"
import { notifyError, notifySuccess } from "~/lib/notify"

import { CatalogEmptyState } from "../components/common/catalog-empty-state"
import { OutletCatalogSelector } from "../components/outlet-catalog/outlet-catalog-selector"
import { OutletProductFilters } from "../components/outlet-catalog/outlet-product-filters"
import { OutletProductList } from "../components/outlet-catalog/outlet-product-list"
import { ProductListSkeleton } from "../components/products/product-list-skeleton"
import { useOutletCatalogContext } from "../hooks/use-outlet-catalog-context"
import { useCategories } from "../services/categories/category.queries"
import { useReorderOutletProducts } from "../services/outlet-catalog/outlet-catalog.mutations"
import { useOutletProducts } from "../services/outlet-catalog/outlet-catalog.queries"
import { PRODUCT_MEDIA_REFRESH_INTERVAL } from "../services/products/product.queries"
import {
    hasOutletCatalogFilters,
    readOutletCatalogFilters,
    resolveOutletCatalogState,
    type OutletCatalogFilterValues,
} from "../utils/outlet-catalog"
import type { OutletCatalogIndexParams } from "../types"

export function OutletCatalogPage() {
    const ctx = useOutletCatalogContext()
    const [searchParams, setSearchParams] = useStableSearchParams()
    const filters = readOutletCatalogFilters(searchParams)

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

    const hasFilters = hasOutletCatalogFilters(filters)

    const params = useMemo<OutletCatalogIndexParams>(
        () => ({
            search: filters.search !== "" ? filters.search : undefined,
            category_id: filters.category_id !== "" ? filters.category_id : undefined,
            status: filters.status !== "" ? filters.status : undefined,
            availability: filters.availability !== "" ? filters.availability : undefined,
            sort: "display_order",
            order: "asc",
            per_page: 100,
        }),
        [filters.search, filters.category_id, filters.status, filters.availability]
    )

    const categoriesQuery = useCategories({ per_page: 100 })
    const productsQuery = useOutletProducts(ctx.outletId, params, {
        refetchInterval: PRODUCT_MEDIA_REFRESH_INTERVAL,
    })
    const outletAuth = useOutletAuthorization(ctx.outletId)
    const reorderMutation = useReorderOutletProducts(ctx.outletId ?? "")

    const canReorder = outletAuth.can(CAP.catalogOrderUpdate)
    const categories = categoriesQuery.data?.data ?? []

    function patchFilters(patch: Partial<OutletCatalogFilterValues>) {
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

        const next = new URLSearchParams(searchParams)
        next.delete("q")
        next.delete("category_id")
        next.delete("status")
        next.delete("availability")
        setSearchParams(next, { replace: true })
    }

    function handleReorder(orderedProductIds: string[]) {
        reorderMutation.mutate(
            orderedProductIds.map((id, index) => ({ product_id: id, display_order: index })),
            {
                onSuccess: () => notifySuccess("Urutan diperbarui"),
                onError: () => notifyError("Gagal memperbarui urutan"),
            }
        )
    }

    if (ctx.isPending) {
        return <ProductListSkeleton rows={4} />
    }

    if (ctx.selection.type === "none") {
        return (
            <CatalogEmptyState
                icon={StoreIcon}
                title="Belum ada outlet"
                description="Anda belum ditugaskan ke outlet mana pun. Hubungi pemilik merchant untuk penugasan outlet."
            />
        )
    }

    const productCount = productsQuery.data?.meta.total ?? null
    const errorState =
        productsQuery.isError && productsQuery.error !== null ? resolveOutletCatalogState(productsQuery.error) : "error"

    return (
        <>
            <OutletCatalogSelector
                outlets={ctx.outlets}
                selectedId={ctx.outletId}
                isPending={ctx.isPending}
                isError={ctx.isError}
                error={ctx.error}
                onRetry={ctx.refetch}
                onSelect={(outletId) => {
                    setReorderMode(false)
                    ctx.selectOutlet(outletId)
                }}
            />

            {ctx.outletId === undefined ? (
                <CatalogEmptyState
                    icon={StoreIcon}
                    title="Pilih outlet"
                    description="Pilih salah satu outlet untuk melihat katalognya."
                />
            ) : (
                <>
                    <OutletProductFilters
                        values={{ ...filters, search: searchInput }}
                        categories={categories}
                        count={productCount}
                        onChange={patchFilters}
                        onReset={resetFilters}
                        reorderMode={reorderMode}
                        canReorder={canReorder}
                        onToggleReorder={() => setReorderMode((mode) => !mode)}
                    />

                    {productsQuery.isPending ? (
                        <ProductListSkeleton rows={4} />
                    ) : productsQuery.isError ? (
                        errorState === "forbidden" ? (
                            <ForbiddenState
                                title="Akses ditolak"
                                description="Anda tidak memiliki akses ke katalog outlet ini."
                            />
                        ) : errorState === "not-found" ? (
                            <CatalogEmptyState
                                icon={StoreIcon}
                                title="Outlet tidak ditemukan"
                                description="Outlet ini tidak tersedia dalam scope Anda."
                            />
                        ) : (
                            <ErrorState
                                title="Gagal memuat produk"
                                description="Terjadi kesalahan saat memuat katalog outlet."
                                onRetry={() => void productsQuery.refetch()}
                            />
                        )
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
                                description="Belum ada produk yang ditugaskan ke outlet ini."
                            />
                        )
                    ) : (
                        <OutletProductList
                            items={productsQuery.data.data}
                            outletId={ctx.outletId}
                            reorderMode={reorderMode && canReorder && !hasFilters}
                            onReorder={handleReorder}
                        />
                    )}
                </>
            )}
        </>
    )
}
