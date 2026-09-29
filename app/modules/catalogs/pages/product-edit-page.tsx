import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { Text } from "~/components/ui/text"
import { useParams } from "react-router"

import { ErrorState } from "~/components/error-state"
import { ListSkeleton } from "~/components/list-skeleton"
import { SubpageHeader } from "~/components/layouts/subpage-header"

import { ReviewSection } from "../components/common/review-section"
import { StatusBadge } from "../components/common/status-badge"
import { ProductInfoSection } from "../components/product-edit/product-info-section"
import { ProductPriceSection } from "../components/product-edit/product-price-section"
import { ProductVariantSection } from "../components/product-edit/product-variant-section"
import { ProductCustomizationSection } from "../components/product-edit/product-customization-section"
import { ProductMediaSection } from "../components/product-edit/product-media-section"
import { ProductOutletSection } from "../components/product-edit/product-outlet-section"
import { useProductEditSections } from "../hooks/use-product-edit-sections"
import { useCategories } from "../services/categories/category.queries"
import { useProductAssignments } from "../services/product-outlets/product-outlet.queries"
import { useProductDetail } from "../services/products/product.queries"
import { formatCurrency } from "../utils/format-currency"
import { CATALOGS_PATHS } from "../utils/paths"

/**
 * The edit screen: one collapsible section per part of a product, each
 * read-only until the merchant asks to change it.
 *
 * The page decides what data to load and which section is open; every section
 * lives in `components/product-edit` and owns its own presentation.
 */
export function ProductEditPage() {
    const { productId } = useParams<{ productId: string }>()

    const detailQuery = useProductDetail(productId)
    const categoriesQuery = useCategories({ status: "active", per_page: 100, sort: "name", order: "asc" })
    const assignmentsQuery = useProductAssignments(productId)

    const sections = useProductEditSections()

    if (productId === undefined) {
        return <ErrorState title="Produk tidak ditemukan" description="ID produk tidak tersedia." />
    }

    if (detailQuery.isPending) {
        return (
            <div className="flex flex-1 flex-col gap-5">
                <Skeleton className="h-10 w-2/3" />
                <ListSkeleton rows={4} className="h-20" />
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
    const categories = categoriesQuery.data?.data ?? []
    const assignments = assignmentsQuery.data ?? []
    const isVariable = product.product_type === "variable"

    return (
        <div className="flex flex-1 flex-col gap-5">
            <SubpageHeader title="Edit Produk" description={product.name} backTo={CATALOGS_PATHS.detail(product.id)} />

            <div className="flex items-center gap-2">
                <Text variant="sm" weight="medium" truncate>
                    {product.name}
                </Text>
                <StatusBadge status={product.status} />
            </div>

            <div className="flex flex-col gap-3">
                {/* Name, category and description. The type is fixed after
                    creation, so it is shown rather than offered as a choice. */}
                <ReviewSection
                    title="Informasi"
                    summary={[product.name, product.category?.name ?? "Tanpa kategori"].join(" • ")}
                    expanded={sections.expanded === "info"}
                    onToggle={() => sections.toggle("info")}
                    headerAction={
                        sections.expanded === "info" && !sections.editing.info ? (
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => sections.startEdit("info")}
                            >
                                Ubah
                            </Button>
                        ) : undefined
                    }
                >
                    <ProductInfoSection
                        product={product}
                        categories={categories}
                        editing={sections.editing.info}
                        onToggleEdit={() => sections.stopEdit("info")}
                    />
                </ReviewSection>

                {/* A variable product's price is its variant list, which has its
                    own section; a simple one just has a number. */}
                {isVariable ? (
                    <ProductVariantSection
                        product={product}
                        isExpanded={sections.expanded === "price"}
                        isEditing={sections.editing.price}
                        onToggle={() => sections.toggle("price")}
                        onStartEdit={() => sections.startEdit("price")}
                        onStopEdit={() => sections.stopEdit("price")}
                    />
                ) : (
                    <ReviewSection
                        title="Harga"
                        summary={product.price != null ? formatCurrency(product.price) : "Harga belum diisi"}
                        expanded={sections.expanded === "price"}
                        onToggle={() => sections.toggle("price")}
                        headerAction={
                            sections.expanded === "price" && !sections.editing.price ? (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => sections.startEdit("price")}
                                >
                                    Ubah
                                </Button>
                            ) : undefined
                        }
                    >
                        <ProductPriceSection
                            product={product}
                            editing={sections.editing.price}
                            onToggleEdit={() => sections.stopEdit("price")}
                        />
                    </ReviewSection>
                )}

                <ProductCustomizationSection
                    product={product}
                    isExpanded={sections.expanded === "customization"}
                    isEditing={sections.editing.customization}
                    onToggle={() => sections.toggle("customization")}
                    onStartEdit={() => sections.startEdit("customization")}
                    onStopEdit={() => sections.stopEdit("customization")}
                />

                <ProductMediaSection
                    product={product}
                    isExpanded={sections.expanded === "media"}
                    isEditing={sections.editing.media}
                    onToggle={() => sections.toggle("media")}
                    onStartEdit={() => sections.startEdit("media")}
                    onStopEdit={() => sections.stopEdit("media")}
                />

                <ProductOutletSection
                    product={product}
                    assignments={assignments}
                    isLoading={assignmentsQuery.isPending}
                    isError={assignmentsQuery.isError}
                    isExpanded={sections.expanded === "outlet"}
                    isEditing={sections.editing.outlet}
                    onToggle={() => sections.toggle("outlet")}
                    onStartEdit={() => sections.startEdit("outlet")}
                    onStopEdit={() => sections.stopEdit("outlet")}
                    onRetry={() => void assignmentsQuery.refetch()}
                />
            </div>
        </div>
    )
}
