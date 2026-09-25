import { useState } from "react"
import { useParams } from "react-router"

import { SubpageHeader } from "~/components/layouts/subpage-header"
import { ErrorState } from "~/components/error-state"
import { Button } from "~/components/ui/button"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Skeleton } from "~/components/ui/skeleton"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"
import { Textarea } from "~/components/ui/textarea"

import { ListSkeleton } from "../components/list-skeleton"
import { MediaManager } from "../components/media-manager"
import { ModifierEditor } from "../components/modifier-editor"
import { OutletAssignment } from "../components/outlet-assignment"
import { ReviewSection } from "../components/review-section"
import { StatusBadge } from "../components/status-badge"
import { VariantEditor } from "../components/variant-editor"
import { useUpdateProduct } from "../services/catalog.mutations"
import { useCategories, useProductAssignments, useProductDetail } from "../services/catalog.queries"
import { productInfoSchema, simplePriceSchema, type ProductInfoFormValues } from "../schemas/catalog.schema"
import { formatCurrency } from "../utils/format-currency"
import { PRODUCT_TYPE_LABEL } from "../utils/labels"
import { notifyError, notifySuccess } from "../utils/notify"
import { CATALOGS_PATHS } from "../utils/paths"
import type { ProductDetail, ProductType } from "../types/catalog.types"

type SectionId = "info" | "price" | "variant" | "customization" | "media" | "outlet"

function issuesToMessages(issues: { path: PropertyKey[]; message: string }[]) {
    const next: Record<string, string> = {}

    for (const issue of issues) {
        const key = String(issue.path[0] ?? "")

        if (next[key] === undefined) {
            next[key] = issue.message
        }
    }

    return next
}

function DetailRows({ rows }: { rows: Array<{ term: string; value: string }> }) {
    return (
        <dl className="flex flex-col divide-y rounded-xl border">
            {rows.map((row) => (
                <div key={row.term} className="flex items-start justify-between gap-4 px-3 py-2">
                    <dt className="shrink-0 text-sm text-muted-foreground">{row.term}</dt>
                    <dd className="text-right text-sm font-medium wrap-break-word">{row.value}</dd>
                </div>
            ))}
        </dl>
    )
}

function InfoSection({
    product,
    categories,
    editing,
    onToggleEdit,
}: {
    product: ProductDetail
    categories: Array<{ id: string; name: string }>
    editing: boolean
    onToggleEdit: () => void
}) {
    const updateMutation = useUpdateProduct(product.id)
    const [values, setValues] = useState<ProductInfoFormValues>(() => ({
        name: product.name,
        category_id: product.category_id,
        description: product.description ?? "",
        product_type: product.product_type,
    }))
    const [errors, setErrors] = useState<Record<string, string>>({})

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const parsed = productInfoSchema.safeParse(values)

        if (!parsed.success) {
            setErrors(issuesToMessages(parsed.error.issues))
            return
        }

        setErrors({})

        const payload: {
            name: string
            category_id: string
            description: string | null
            product_type: ProductType
            price?: number | null
        } = {
            name: parsed.data.name,
            category_id: parsed.data.category_id,
            description: parsed.data.description ?? null,
            product_type: parsed.data.product_type,
        }

        if (parsed.data.product_type === "variable" && product.product_type !== "variable") {
            payload.price = null
        }

        updateMutation.mutate(payload, {
            onSuccess: () => {
                notifySuccess("Informasi disimpan")
                onToggleEdit()
            },
            onError: () => notifyError("Gagal menyimpan informasi"),
        })
    }

    if (editing) {
        return (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <Field>
                    <FieldLabel htmlFor="edit-name">Nama Produk</FieldLabel>
                    <Input
                        id="edit-name"
                        value={values.name}
                        onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
                        aria-invalid={errors.name !== undefined}
                        className="h-11"
                    />
                    {errors.name !== undefined ? <FieldError>{errors.name}</FieldError> : null}
                </Field>

                <Field>
                    <FieldLabel htmlFor="edit-category">Kategori</FieldLabel>
                    <Select
                        value={values.category_id}
                        onValueChange={(value) =>
                            setValues((current) => ({ ...current, category_id: value ?? current.category_id }))
                        }
                    >
                        <SelectTrigger id="edit-category" className="h-11 w-full">
                            <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.category_id !== undefined ? <FieldError>{errors.category_id}</FieldError> : null}
                </Field>

                <Field>
                    <FieldLabel htmlFor="edit-description">Deskripsi (opsional)</FieldLabel>
                    <Textarea
                        id="edit-description"
                        value={values.description ?? ""}
                        onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
                        rows={3}
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="edit-type">Tipe Produk</FieldLabel>
                    <Select
                        value={values.product_type}
                        onValueChange={(value) =>
                            setValues((current) => ({
                                ...current,
                                product_type: (value ?? current.product_type) as ProductType,
                            }))
                        }
                    >
                        <SelectTrigger id="edit-type" className="h-11 w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="simple">Simple Product</SelectItem>
                            <SelectItem value="variable">Variable Product</SelectItem>
                        </SelectContent>
                    </Select>
                    {values.product_type !== product.product_type ? (
                        <Text variant="xs" className="text-muted-foreground">
                            {values.product_type === "variable"
                                ? "Mengubah ke variable akan mengosongkan harga tunggal."
                                : "Mengubah ke simple — lengkapi harga di bagian Harga."}
                        </Text>
                    ) : null}
                </Field>

                <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={onToggleEdit}>
                        Batal
                    </Button>
                    <Button type="submit" className="flex-1" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? (
                            <>
                                <Spinner /> Menyimpan…
                            </>
                        ) : (
                            "Simpan"
                        )}
                    </Button>
                </div>
            </form>
        )
    }

    return (
        <DetailRows
            rows={[
                { term: "Nama", value: product.name },
                { term: "Kategori", value: product.category?.name ?? "Tanpa kategori" },
                { term: "Deskripsi", value: product.description ?? "-" },
                { term: "Tipe produk", value: PRODUCT_TYPE_LABEL[product.product_type] },
            ]}
        />
    )
}

function PriceSection({
    product,
    editing,
    onToggleEdit,
}: {
    product: ProductDetail
    editing: boolean
    onToggleEdit: () => void
}) {
    const updateMutation = useUpdateProduct(product.id)
    const [priceRaw, setPriceRaw] = useState(() => (product.price != null ? String(product.price) : ""))
    const [errors, setErrors] = useState<Record<string, string>>({})

    if (product.product_type === "variable") {
        return null
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const parsed = simplePriceSchema.safeParse({ price: priceRaw })

        if (!parsed.success) {
            setErrors(issuesToMessages(parsed.error.issues))
            return
        }

        setErrors({})

        updateMutation.mutate(
            { product_type: "simple", price: parsed.data.price },
            {
                onSuccess: () => {
                    notifySuccess("Harga disimpan")
                    onToggleEdit()
                },
                onError: () => notifyError("Gagal menyimpan harga"),
            }
        )
    }

    if (editing) {
        return (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <Field>
                    <FieldLabel htmlFor="edit-price">Harga (Rp)</FieldLabel>
                    <Input
                        id="edit-price"
                        inputMode="numeric"
                        value={priceRaw}
                        onChange={(event) => {
                            setPriceRaw(event.target.value)
                            setErrors({})
                        }}
                        aria-invalid={errors.price !== undefined}
                        className="h-11"
                    />
                    {errors.price !== undefined ? <FieldError>{errors.price}</FieldError> : null}
                </Field>

                <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={onToggleEdit}>
                        Batal
                    </Button>
                    <Button type="submit" className="flex-1" disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? (
                            <>
                                <Spinner /> Menyimpan…
                            </>
                        ) : (
                            "Simpan"
                        )}
                    </Button>
                </div>
            </form>
        )
    }

    return (
        <Text variant="base" weight="semibold">
            {formatCurrency(product.price)}
        </Text>
    )
}

function ReadMediaGrid({ product }: { product: ProductDetail }) {
    const media = product.media ?? []

    if (media.length === 0) {
        return (
            <Text variant="sm" className="text-muted-foreground">
                Belum ada foto.
            </Text>
        )
    }

    return (
        <div className="flex flex-wrap gap-2">
            {media.map((item) => (
                <div key={item.id} className="relative size-16 overflow-hidden rounded-lg border bg-muted">
                    {item.url != null ? (
                        <img src={item.url} alt={item.alt_text ?? ""} className="size-full object-cover" />
                    ) : null}
                    {item.is_primary ? (
                        <span className="absolute top-0.5 left-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-primary-foreground">
                            Utama
                        </span>
                    ) : null}
                </div>
            ))}
        </div>
    )
}

function ReadOutlets({ assignments }: { assignments: Array<{ id: string; outlet_name?: string; outlet_id: string }> }) {
    if (assignments.length === 0) {
        return (
            <Text variant="sm" className="text-muted-foreground">
                Belum ada outlet yang ditugaskan.
            </Text>
        )
    }

    return (
        <ul className="flex flex-col gap-1.5">
            {assignments.map((assignment) => (
                <li key={assignment.id} className="rounded-lg border px-3 py-2">
                    <Text variant="sm">{assignment.outlet_name ?? assignment.outlet_id}</Text>
                </li>
            ))}
        </ul>
    )
}

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
                <InfoSection
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
                <PriceSection product={product} editing={editing.price} onToggleEdit={() => stopEdit("price")} />
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
                    <ReadMediaGrid product={product} />
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
                    <ReadOutlets
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
