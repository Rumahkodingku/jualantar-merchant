import { useState } from "react"
import { useParams } from "react-router"

import { SubpageHeader } from "~/components/layouts/subpage-header"
import { ErrorState } from "~/components/error-state"
import { Button } from "~/components/ui/button"
import { Skeleton } from "~/components/ui/skeleton"
import { Text } from "~/components/ui/text"

import { ListSkeleton } from "~/components/list-skeleton"
import { MediaManager } from "../components/media/media-manager"
import { ModifierEditor } from "../components/modifiers/modifier-editor"
import { OutletAssignment } from "../components/outlets/outlet-assignment"
import { ProductInfoSection } from "../components/product/product-info-section"
import { ProductPriceSection } from "../components/product/product-price-section"
import { ProductMediaGrid, ProductOutletsList } from "../components/product/product-readonly-sections"
import { ReviewSection } from "../components/review-section"
import { StatusBadge } from "../components/status-badge"
import { VariantEditor } from "../components/variants/variant-editor"
import { useCategories } from "../services/categories/category.queries"
import { useProductAssignments } from "../services/product-outlets/product-outlet.queries"
import { useProductDetail } from "../services/products/product.queries"
import { formatCurrency } from "../utils/format-currency"
import { PRODUCT_TYPE_LABEL } from "../utils/labels"
import { CATALOGS_PATHS } from "../utils/paths"

type SectionId = "info" | "price" | "variant" | "customization" | "media" | "outlet"

export function ProductEditPage() {
    const { productId } = useParams<{ productId: string }>()

    const detailQuery = useProductDetail(productId)
    const categoriesQuery = useCategories({ status: "active", per_page: 100, sort: "name", order: "asc" })
    const assignmentsQuery = useProductAssignments(productId)

    const [expanded, setExpanded] = useState<SectionId>("info")
    const [editing, setEditing] = useState<Record<SectionId, boolean>>({
        info: true,
        price: false,
        variant: false,
        customization: false,
        media: false,
        outlet: false,
    })

    function toggleSection(id: SectionId) {
        setExpanded((current) => (current === id ? ("info" as SectionId) : id))
    }

    function startEdit(id: SectionId) {
        setExpanded(id)
        setEditing((current) => ({ ...current, [id]: true }))
    }

    function stopEdit(id: SectionId) {
        setEditing((current) => ({ ...current, [id]: false }))
    }

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
    const variants = product.variants ?? []
    const groups = product.modifier_groups ?? []
    const media = product.media ?? []
    const assignments = assignmentsQuery.data ?? []
    const isVariable = product.product_type === "variable"

    const sections: Array<{
        id: SectionId
        title: string
        summary: string
        headerAction: React.ReactNode
        body: React.ReactNode
    }> = [
        {
            id: "info",
            title: "Informasi",
            summary: [product.name, product.category?.name ?? "Tanpa kategori"].join(" • "),
            headerAction: (
                <Button type="button" size="sm" variant="outline" onClick={() => startEdit("info")}>
                    Ubah
                </Button>
            ),
            body: (
                <ProductInfoSection
                    product={product}
                    categories={categories}
                    editing={editing.info}
                    onToggleEdit={() => stopEdit("info")}
                />
            ),
        },
        {
            id: "price",
            title: isVariable ? "Variant" : "Harga",
            summary: isVariable
                ? `${variants.length} variant`
                : product.price != null
                  ? formatCurrency(product.price)
                  : "Harga belum diisi",
            headerAction: (
                <Button type="button" size="sm" variant="outline" onClick={() => startEdit("price")}>
                    Ubah
                </Button>
            ),
            body: isVariable ? (
                editing.price ? (
                    <div className="flex flex-col gap-3">
                        <VariantEditor productId={product.id} variants={variants} />
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="self-start"
                            onClick={() => stopEdit("price")}
                        >
                            Selesai
                        </Button>
                    </div>
                ) : variants.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-5">
                        <Text variant="sm" className="text-muted-foreground">
                            Belum ada variant.
                        </Text>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <ul className="flex flex-col gap-1.5">
                            {variants.map((variant) => (
                                <li
                                    key={variant.id}
                                    className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                                >
                                    <span className="flex min-w-0 flex-col">
                                        <Text variant="sm" truncate>
                                            {variant.name}
                                            {variant.is_default ? " (default)" : ""}
                                        </Text>
                                        <Text variant="xs" className="text-muted-foreground">
                                            {PRODUCT_TYPE_LABEL.simple} •{" "}
                                            {variant.status === "active" ? "Aktif" : "Nonaktif"}
                                        </Text>
                                    </span>
                                    <Text variant="sm" className="shrink-0">
                                        {formatCurrency(variant.price)}
                                    </Text>
                                </li>
                            ))}
                        </ul>
                        <Button type="button" size="sm" className="self-start" onClick={() => startEdit("price")}>
                            Ubah
                        </Button>
                    </div>
                )
            ) : (
                <ProductPriceSection product={product} editing={editing.price} onToggleEdit={() => stopEdit("price")} />
            ),
        },
        {
            id: "customization",
            title: "Customization",
            summary: groups.length > 0 ? `${groups.length} modifier group` : "Tidak ada customization",
            headerAction: (
                <Button type="button" size="sm" variant="outline" onClick={() => startEdit("customization")}>
                    Ubah
                </Button>
            ),
            body: editing.customization ? (
                <div className="flex flex-col gap-3">
                    <ModifierEditor productId={product.id} groups={groups} />
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="self-start"
                        onClick={() => stopEdit("customization")}
                    >
                        Selesai
                    </Button>
                </div>
            ) : groups.length === 0 ? (
                <Text variant="sm" className="text-muted-foreground">
                    Belum ada modifier group.
                </Text>
            ) : (
                <div className="flex flex-col gap-3">
                    {groups.map((group) => (
                        <div key={group.id} className="rounded-xl border p-3">
                            <div className="flex items-center justify-between gap-2">
                                <Text variant="sm" weight="semibold">
                                    {group.name}
                                </Text>
                                <StatusBadge status={group.status} />
                            </div>
                            <Text variant="xs" className="text-muted-foreground">
                                {group.modifiers.length} modifier • {group.is_required ? "Wajib" : "Opsional"}
                            </Text>
                        </div>
                    ))}
                    <Button type="button" size="sm" className="self-start" onClick={() => startEdit("customization")}>
                        Ubah
                    </Button>
                </div>
            ),
        },
        {
            id: "media",
            title: "Media",
            summary: `${media.length} foto`,
            headerAction: (
                <Button type="button" size="sm" variant="outline" onClick={() => startEdit("media")}>
                    Ubah
                </Button>
            ),
            body: editing.media ? (
                <div className="flex flex-col gap-3">
                    <MediaManager productId={product.id} media={media} />
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="self-start"
                        onClick={() => stopEdit("media")}
                    >
                        Selesai
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <ProductMediaGrid product={product} />
                    <Button type="button" size="sm" className="self-start" onClick={() => startEdit("media")}>
                        Ubah
                    </Button>
                </div>
            ),
        },
        {
            id: "outlet",
            title: "Outlet",
            summary: `${assignments.length} outlet`,
            headerAction: (
                <Button type="button" size="sm" variant="outline" onClick={() => startEdit("outlet")}>
                    Ubah
                </Button>
            ),
            body: assignmentsQuery.isPending ? (
                <ListSkeleton rows={2} className="h-20" />
            ) : assignmentsQuery.isError ? (
                <ErrorState title="Gagal memuat outlet" onRetry={() => void assignmentsQuery.refetch()} />
            ) : editing.outlet ? (
                <div className="flex flex-col gap-3">
                    <OutletAssignment productId={product.id} assignments={assignments} />
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="self-start"
                        onClick={() => stopEdit("outlet")}
                    >
                        Selesai
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <ProductOutletsList
                        assignments={assignments.map((assignment) => ({
                            id: assignment.id,
                            outlet_id: assignment.outlet_id,
                            outlet_name: assignment.outlet?.name,
                        }))}
                    />
                    <Button type="button" size="sm" className="self-start" onClick={() => startEdit("outlet")}>
                        Ubah
                    </Button>
                </div>
            ),
        },
    ]

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
                {sections.map((section) => (
                    <ReviewSection
                        key={section.id}
                        title={section.title}
                        summary={section.summary}
                        expanded={expanded === section.id}
                        onToggle={() => toggleSection(section.id)}
                        headerAction={
                            expanded === section.id && !editing[section.id] ? section.headerAction : undefined
                        }
                    >
                        <div className="flex flex-col gap-3">
                            {expanded === section.id &&
                            !editing[section.id] &&
                            section.id !== "info" &&
                            section.id !== "price" ? (
                                <div className="flex justify-end">{section.headerAction}</div>
                            ) : null}
                            {section.body}
                        </div>
                    </ReviewSection>
                ))}
            </div>
        </div>
    )
}
