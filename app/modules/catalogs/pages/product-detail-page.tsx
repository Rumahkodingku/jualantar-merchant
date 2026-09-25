import { ChevronLeftIcon } from "lucide-react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router"

import { ErrorState } from "~/components/error-state"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

import { ListSkeleton } from "~/components/list-skeleton"
import { MediaManager } from "../components/media/media-manager"
import { ModifierEditor } from "../components/modifiers/modifier-editor"
import { OutletAssignment } from "../components/outlets/outlet-assignment"
import { ProductInfoPanel } from "../components/product/product-info-panel"
import { StatusBadge } from "../components/status-badge"
import { VariantEditor } from "../components/variants/variant-editor"
import { useProductAssignments } from "../services/product-outlets/product-outlet.queries"
import { useProductDetail } from "../services/products/product.queries"
import { CATALOGS_PATHS } from "../utils/paths"

const TABS = [
    { value: "informasi", label: "Informasi" },
    { value: "variant", label: "Variant" },
    { value: "customization", label: "Customization" },
    { value: "media", label: "Media" },
    { value: "outlet", label: "Outlet" },
] as const

type DetailTab = (typeof TABS)[number]["value"]

function readTab(value: string | null): DetailTab {
    return TABS.some((tab) => tab.value === value) ? (value as DetailTab) : "informasi"
}

export function ProductDetailPage() {
    const { productId } = useParams<{ productId: string }>()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const tab = readTab(searchParams.get("tab"))

    const detailQuery = useProductDetail(productId)
    const assignmentsQuery = useProductAssignments(tab === "outlet" ? productId : undefined)

    function setTab(next: DetailTab) {
        const params = new URLSearchParams(searchParams)

        if (next === "informasi") {
            params.delete("tab")
        } else {
            params.set("tab", next)
        }

        setSearchParams(params, { replace: true })
    }

    if (productId === undefined) {
        return <ErrorState title="Produk tidak ditemukan" description="ID produk tidak tersedia." />
    }

    if (detailQuery.isPending) {
        return (
            <div className="flex flex-1 flex-col gap-5">
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="h-10 w-full" />
                <ListSkeleton rows={3} className="h-20" />
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

    return (
        <div className="flex flex-1 flex-col gap-5">
            <div className="flex items-start gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Kembali"
                    className="-ml-2 size-10 shrink-0"
                    onClick={() => void navigate(CATALOGS_PATHS.home)}
                >
                    <ChevronLeftIcon />
                </Button>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <Text as="h1" variant="xl" weight="semibold" className="tracking-tight" truncate>
                        {product.name}
                    </Text>
                    <StatusBadge status={product.status} className="self-start" />
                </div>

                <Button render={<Link to={CATALOGS_PATHS.edit(product.id)} />} size="sm" className="shrink-0">
                    Edit Produk
                </Button>
            </div>

            <div role="tablist" aria-label="Bagian detail produk" className="no-scrollbar flex gap-2 overflow-x-auto">
                {TABS.map((item) => (
                    <button
                        key={item.value}
                        type="button"
                        role="tab"
                        aria-selected={tab === item.value}
                        onClick={() => setTab(item.value)}
                        className={cn(
                            "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                            tab === item.value
                                ? "border-primary bg-primary text-primary-foreground"
                                : "bg-card text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {tab === "informasi" ? <ProductInfoPanel product={product} /> : null}

            {tab === "variant" ? (
                product.product_type === "simple" ? (
                    <div className="rounded-2xl border border-dashed p-5">
                        <Text variant="sm" className="text-muted-foreground">
                            Product ini menggunakan satu harga dan tidak memiliki variant.
                        </Text>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <Text as="h2" variant="base" weight="semibold">
                            Variant
                        </Text>
                        <VariantEditor productId={product.id} variants={product.variants ?? []} />
                    </div>
                )
            ) : null}

            {tab === "customization" ? (
                <div className="flex flex-col gap-3">
                    <Text as="h2" variant="base" weight="semibold">
                        Customization
                    </Text>
                    <Text variant="xs" className="text-muted-foreground">
                        Tambahkan pilihan yang dapat dipilih pelanggan.
                    </Text>
                    <ModifierEditor productId={product.id} groups={product.modifier_groups ?? []} />
                </div>
            ) : null}

            {tab === "media" ? (
                <div className="flex flex-col gap-3">
                    <Text as="h2" variant="base" weight="semibold">
                        Foto Produk
                    </Text>
                    <MediaManager productId={product.id} media={product.media ?? []} />
                </div>
            ) : null}

            {tab === "outlet" ? (
                <div className="flex flex-col gap-3">
                    <Text as="h2" variant="base" weight="semibold">
                        Outlet
                    </Text>
                    {assignmentsQuery.isPending ? (
                        <ListSkeleton rows={2} className="h-24" />
                    ) : assignmentsQuery.isError ? (
                        <ErrorState title="Gagal memuat outlet" onRetry={() => void assignmentsQuery.refetch()} />
                    ) : (
                        <OutletAssignment productId={product.id} assignments={assignmentsQuery.data ?? []} />
                    )}
                </div>
            ) : null}
        </div>
    )
}
