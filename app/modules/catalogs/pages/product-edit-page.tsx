import { useNavigate, useParams } from "react-router"

import { ErrorState } from "~/components/error-state"
import { ListSkeleton } from "~/components/list-skeleton"
import { SubpageHeader } from "~/components/layouts/subpage-header"

import { ProductEditWizard } from "../components/product-edit/product-edit-wizard"
import { useCategories } from "../services/categories/category.queries"
import { toEditForm } from "../services/product-edit/to-edit-form"
import { useOutlets, useProductAssignments } from "../services/product-outlets/product-outlet.queries"
import { useProductDetail } from "../services/products/product.queries"
import { CATALOGS_PATHS } from "../utils/paths"
import type { EditSnapshot, ProductDetail } from "../types"

/**
 * The "edit product" screen.
 *
 * All it does is decide which of the states the merchant is in — something is
 * still loading, something could not be read, or the wizard can be shown — and
 * hand over to `ProductEditWizard`. Nothing about the steps, the form or the save
 * belongs here.
 *
 * Three requests are waited on before the wizard opens: the product itself, the
 * categories its information step offers, and the outlets it is currently
 * assigned to. The last one is not cosmetic — the wizard is seeded once from what
 * these return, and a form seeded before the assignments arrive would read every
 * outlet as unassigned and quietly un-assign them on save. Waiting is the honest
 * version of that; the alternative is a wizard that has to reconcile a late
 * arrival into an edit already in progress.
 */
export function ProductEditPage() {
    const { productId } = useParams<{ productId: string }>()
    const navigate = useNavigate()

    const detailQuery = useProductDetail(productId)
    const categoriesQuery = useCategories({ status: "active", per_page: 100, sort: "name", order: "asc" })
    const assignmentsQuery = useProductAssignments(productId)
    const outletsQuery = useOutlets()

    if (productId === undefined) {
        return <ErrorState title="Produk tidak ditemukan" description="ID produk tidak tersedia." />
    }

    const isLoading = detailQuery.isPending || categoriesQuery.isPending || assignmentsQuery.isPending

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-5">
                <SubpageHeader
                    title="Edit Produk"
                    description="Lengkapi langkah untuk mengubah produk."
                    backTo={CATALOGS_PATHS.detail(productId)}
                />
                <ListSkeleton rows={3} className="h-24" />
            </div>
        )
    }

    if (detailQuery.isError || detailQuery.data === undefined) {
        return (
            <ErrorState
                title="Gagal memuat produk"
                description="Terjadi kesalahan saat memuat detail produk."
                onRetry={() => void detailQuery.refetch()}
            />
        )
    }

    if (categoriesQuery.isError) {
        return (
            <ErrorState
                title="Gagal memuat kategori"
                description="Terjadi kesalahan saat memuat data kategori."
                onRetry={() => void categoriesQuery.refetch()}
            />
        )
    }

    if (assignmentsQuery.isError) {
        return (
            <ErrorState
                title="Gagal memuat outlet produk"
                description="Daftar outlet produk tidak dapat dimuat. Coba lagi sebelum mengubah produk."
                onRetry={() => void assignmentsQuery.refetch()}
            />
        )
    }

    const product = detailQuery.data
    const categories = categoriesQuery.data?.data ?? []
    const outlets = outletsQuery.data ?? []
    const outletIds = (assignmentsQuery.data ?? []).map((assignment) => assignment.outlet_id)

    return (
        <div className="flex flex-1 flex-col gap-4">
            <SubpageHeader
                title="Edit Produk"
                description="Lengkapi langkah untuk mengubah produk."
                backTo={CATALOGS_PATHS.detail(productId)}
            />

            <ProductEditWizard
                productId={product.id}
                productName={product.name}
                productType={product.product_type}
                categories={categories}
                outlets={outlets}
                assignments={assignmentsQuery.data ?? []}
                isOutletsPending={outletsQuery.isPending}
                isOutletsError={outletsQuery.isError}
                onRetryOutlets={() => void outletsQuery.refetch()}
                form={toEditForm(product, outletIds)}
                snapshot={toEditSnapshot(product, outletIds)}
                onSaved={() => void navigate(CATALOGS_PATHS.detail(product.id))}
            />
        </div>
    )
}

/**
 * What the save diffs against: the product exactly as the API last reported it.
 *
 * The child collections are kept in the shape they arrived in rather than being
 * folded into the form's row shape, because the form's rows have been given keys
 * and a form's row is a thing being edited — the snapshot has to stay a record
 * of what is actually saved.
 */
function toEditSnapshot(product: ProductDetail, outletIds: string[]): EditSnapshot {
    return {
        name: product.name,
        category_id: product.category_id,
        description: product.description ?? null,
        price: product.price,
        outletIds,
        variants: product.variants ?? [],
        groups: product.modifier_groups ?? [],
        media: product.media ?? [],
    }
}
