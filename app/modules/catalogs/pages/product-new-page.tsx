import { useNavigate } from "react-router"

import { ErrorState } from "~/components/error-state"
import { ListSkeleton } from "~/components/list-skeleton"
import { SubpageHeader } from "~/components/layouts/subpage-header"

import { ProductWizard } from "../components/product-wizard/product-wizard"
import { useCategories } from "../services/categories/category.queries"
import { useProductDraft as useProductDraftQuery } from "../services/product-draft/product-draft.queries"
import { CATALOGS_PATHS } from "../utils/paths"

/**
 * The "add product" screen.
 *
 * All it does is decide which of the three states the merchant is in — the draft
 * is still loading, the draft could not be read, or the wizard can be shown —
 * and hand over to `ProductWizard`. Nothing about the form belongs here.
 *
 * The draft is read as a plain query rather than through `useProductDraft`
 * because that hook owns the form and its autosave; holding a second copy here
 * would start a second writer racing the wizard's.
 */
export function ProductNewPage() {
    const navigate = useNavigate()
    const draftQuery = useProductDraftQuery()
    const categoriesQuery = useCategories({ status: "active", per_page: 100, sort: "name", order: "asc" })

    // The wizard reads the same two sources itself; this render only waits for
    // them so the merchant never sees an empty frame before an error or a form.
    const isLoading = draftQuery.isPending || categoriesQuery.isPending

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col gap-5">
                <SubpageHeader
                    title="Tambah Produk"
                    description="Lengkapi langkah untuk menambahkan produk."
                    backTo={CATALOGS_PATHS.home}
                />
                <ListSkeleton rows={3} className="h-24" />
            </div>
        )
    }

    if (draftQuery.isError) {
        return (
            <ErrorState
                title="Gagal memuat draft"
                description="Isian yang tersimpan tidak dapat dimuat. Coba lagi sebelum mengisi ulang."
                onRetry={() => void draftQuery.refetch()}
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

    return (
        <div className="flex flex-1 flex-col gap-4">
            <SubpageHeader
                title="Tambah Produk"
                description="Lengkapi langkah untuk menambahkan produk."
                backTo={CATALOGS_PATHS.home}
            />

            <ProductWizard onCreated={(productId) => void navigate(CATALOGS_PATHS.detail(productId))} />
        </div>
    )
}
