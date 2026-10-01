import { ChevronLeftIcon, StoreIcon } from "lucide-react"
import { useNavigate, useParams } from "react-router"
import { ErrorState } from "~/components/error-state"
import { ForbiddenState } from "~/components/forbidden-state"
import { ListSkeleton } from "~/components/list-skeleton"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { Text } from "~/components/ui/text"
import { CAP, useOutletAuthorization } from "~/modules/authorization"
import { useOperationalOutlet } from "~/modules/merchant-operations"
import { CatalogEmptyState } from "../components/common/catalog-empty-state"
import { OutletProductDetail } from "../components/outlet-catalog/outlet-product-detail"
import { useOutletProductDetail } from "../services/outlet-catalog/outlet-catalog.queries"
import { resolveOutletCatalogState } from "../utils/outlet-catalog"
import { CATALOGS_PATHS } from "../utils/paths"

export function OutletProductDetailPage() {
    const { outletId, productId } = useParams<{ outletId: string; productId: string }>()
    const navigate = useNavigate()

    const outletQuery = useOperationalOutlet(outletId)
    const detailQuery = useOutletProductDetail(outletId, productId)
    const outletAuth = useOutletAuthorization(outletId)

    const backTo = outletId === undefined ? CATALOGS_PATHS.home : `${CATALOGS_PATHS.home}?outlet=${outletId}`
    const outletLabel = outletQuery.data?.name ?? outletId ?? "outlet"

    function goBack() {
        void navigate(backTo)
    }

    if (outletId === undefined || productId === undefined) {
        return <ErrorState title="Produk tidak ditemukan" description="ID outlet atau produk tidak tersedia." />
    }

    if (detailQuery.isPending) {
        return (
            <div className="flex flex-1 flex-col gap-5">
                <div className="flex items-center gap-2">
                    <Skeleton className="size-10 shrink-0 rounded-xl" />
                    <Skeleton className="h-6 flex-1" />
                </div>
                <Skeleton className="aspect-video w-full rounded-2xl" />
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-6 w-2/3" />
                </div>
                <ListSkeleton rows={3} className="h-16" />
            </div>
        )
    }

    if (detailQuery.isError || detailQuery.data === undefined) {
        const state = resolveOutletCatalogState(detailQuery.error)

        if (state === "forbidden") {
            return (
                <ForbiddenState
                    title="Akses ditolak"
                    description="Anda tidak memiliki akses ke produk pada outlet ini."
                    action={
                        <Button type="button" variant="outline" onClick={goBack}>
                            Kembali ke katalog
                        </Button>
                    }
                />
            )
        }

        if (state === "not-found") {
            return (
                <CatalogEmptyState
                    icon={StoreIcon}
                    title="Produk tidak ditemukan"
                    description="Produk ini tidak tersedia pada outlet yang Anda buka."
                    action={
                        <Button type="button" variant="outline" onClick={goBack}>
                            Kembali ke katalog
                        </Button>
                    }
                />
            )
        }

        return (
            <ErrorState
                title="Gagal memuat produk"
                description="Terjadi kesalahan saat memuat detail produk outlet."
                onRetry={() => void detailQuery.refetch()}
            />
        )
    }

    return (
        <div className="flex flex-1 flex-col gap-5">
            <div className="grid grid-cols-[2.5rem_1fr] items-center gap-1">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Kembali"
                    className="-ml-2 size-10 shrink-0 justify-self-start"
                    onClick={goBack}
                >
                    <ChevronLeftIcon />
                </Button>

                <div className="flex min-w-0 flex-col">
                    <Text as="span" variant="base" weight="semibold" truncate>
                        {detailQuery.data.product.name}
                    </Text>
                    <Text as="span" variant="xs" className="text-muted-foreground" truncate>
                        {outletLabel}
                    </Text>
                </div>
            </div>

            <OutletProductDetail
                item={detailQuery.data}
                outletId={outletId}
                outletLabel={outletLabel}
                canUpdateAvailability={outletAuth.can(CAP.catalogAvailabilityUpdate)}
                canUpdateAssignmentStatus={outletAuth.can(CAP.catalogAssignmentStatusUpdate)}
                canUpdateVariantStatus={outletAuth.can(CAP.catalogVariantStatusUpdate)}
                canUpdateCustomizationStatus={outletAuth.can(CAP.catalogCustomizationStatusUpdate)}
            />
        </div>
    )
}
