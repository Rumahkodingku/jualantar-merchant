import { useState } from "react"
import { useParams, useSearchParams } from "react-router"

import { ErrorState } from "~/components/error-state"
import { ListSkeleton } from "~/components/list-skeleton"
import { Skeleton } from "~/components/ui/skeleton"
import { Tabs, TabsContent } from "~/components/ui/tabs"

import { ProductCustomizationView } from "../components/product-detail/product-customization-view"
import { ProductDetailHeader } from "../components/product-detail/product-detail-header"
import { PRODUCT_DETAIL_TABS, type ProductDetailTab } from "../components/product-detail/product-detail-tabs"
import { ProductInfoDetails } from "../components/product-detail/product-info-details"
import { ProductMediaGallery } from "../components/product-detail/product-media-gallery"
import { ProductOutletList } from "../components/product-detail/product-outlet-list"
import { ProductPhotoViewer } from "../components/product-detail/product-photo-viewer"
import { ProductSummary } from "../components/product-detail/product-summary"
import { ProductVariantList } from "../components/product-detail/product-variant-list"
import { useProductOutletRows } from "../services/product-outlets/product-outlet.queries"
import { useProductDetail } from "../services/products/product.queries"

const DEFAULT_TAB: ProductDetailTab = "ringkasan"

function readTab(value: string | null): ProductDetailTab {
    return PRODUCT_DETAIL_TABS.some((tab) => tab.value === value) ? (value as ProductDetailTab) : DEFAULT_TAB
}

export function ProductDetailPage() {
    const { productId } = useParams<{ productId: string }>()
    const [searchParams, setSearchParams] = useSearchParams()
    const tab = readTab(searchParams.get("tab"))

    const [viewerIndex, setViewerIndex] = useState(0)
    const [viewerOpen, setViewerOpen] = useState(false)

    const detailQuery = useProductDetail(productId)
    const outletRowsQuery = useProductOutletRows(productId, tab === "outlet")

    function setTab(next: ProductDetailTab) {
        const params = new URLSearchParams(searchParams)

        if (next === DEFAULT_TAB) {
            params.delete("tab")
        } else {
            params.set("tab", next)
        }

        setSearchParams(params, { replace: true, preventScrollReset: true })
    }

    function openViewer(index: number) {
        setViewerIndex(index)
        setViewerOpen(true)
    }

    if (productId === undefined) {
        return <ErrorState title="Produk tidak ditemukan" description="ID produk tidak tersedia." />
    }

    if (detailQuery.isPending) {
        return (
            <div className="flex flex-1 flex-col gap-5">
                <div className="flex items-center gap-2">
                    <Skeleton className="size-10 shrink-0 rounded-xl" />
                    <Skeleton className="h-6 flex-1" />
                    <Skeleton className="size-7 shrink-0 rounded-xl" />
                </div>
                <Skeleton className="aspect-video w-full rounded-2xl" />
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-5 w-1/4" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map((item) => (
                        <Skeleton key={item} className="h-20 rounded-2xl" />
                    ))}
                </div>
                <Skeleton className="h-10 w-full" />
                <ListSkeleton rows={3} className="h-16" />
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

    const product = detailQuery.data
    const media = product.media ?? []

    return (
        <div className="flex flex-1 flex-col gap-5">
            <ProductDetailHeader product={product} />

            <Tabs value={tab} onValueChange={(value) => setTab(value as ProductDetailTab)}>
                <ProductSummary product={product} onSelectTab={setTab} />

                <TabsContent value="ringkasan">
                    <ProductInfoDetails product={product} />
                </TabsContent>

                <TabsContent value="variant">
                    <ProductVariantList product={product} />
                </TabsContent>

                <TabsContent value="customization">
                    <ProductCustomizationView groups={product.modifier_groups ?? []} />
                </TabsContent>

                <TabsContent value="media">
                    <ProductMediaGallery media={media} onOpen={openViewer} />
                    <ProductPhotoViewer
                        media={media}
                        index={viewerIndex}
                        onIndexChange={setViewerIndex}
                        open={viewerOpen}
                        onOpenChange={setViewerOpen}
                    />
                </TabsContent>

                <TabsContent value="outlet">
                    {outletRowsQuery.isPending ? (
                        <ListSkeleton rows={2} className="h-20" />
                    ) : outletRowsQuery.isError ? (
                        <ErrorState title="Gagal memuat outlet" onRetry={() => void outletRowsQuery.refetch()} />
                    ) : (
                        <ProductOutletList rows={outletRowsQuery.rows} />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
