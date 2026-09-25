import { useState } from "react"
import { useNavigate } from "react-router"
import { SubpageHeader } from "~/components/layouts/subpage-header"
import { ErrorState } from "~/components/error-state"
import { Button } from "~/components/ui/button"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"
import { Textarea } from "~/components/ui/textarea"
import { cn } from "~/lib/utils"
import { ListSkeleton } from "../components/list-skeleton"
import { ReviewSection } from "../components/review-section"
import {
    GroupDraftEditor,
    MediaDraftPicker,
    OutletDraftPicker,
    VariantDraftEditor,
    type GroupDraft,
    type MediaDraft,
    type VariantDraft,
} from "../components/wizard/wizard-drafts"
import { useCreateProductBundle } from "../services/catalog.mutations"
import { useCategories, useOutlets } from "../services/catalog.queries"
import { productInfoSchema, simplePriceSchema, type ProductInfoFormValues } from "../schemas/catalog.schema"
import { formatCurrency } from "../utils/format-currency"
import { PRODUCT_TYPE_FORM_LABEL, PRODUCT_TYPE_LABEL } from "../utils/labels"
import { notifyError, notifySuccess } from "../utils/notify"
import { CATALOGS_PATHS } from "../utils/paths"
import type { ProductType } from "../types/catalog.types"
import { MoveLeft, MoveRight } from "lucide-react"

const STEPS = [
    { id: "info", label: "Informasi" },
    { id: "price", label: "Harga / Variant" },
    { id: "customization", label: "Customization" },
    { id: "media", label: "Media" },
    { id: "outlet", label: "Outlet" },
    { id: "review", label: "Review" },
] as const

type StepId = (typeof STEPS)[number]["id"]

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

function StepShell({
    title,
    description,
    children,
}: {
    title: string
    description?: string
    children: React.ReactNode
}) {
    return (
        <section className="flex flex-col gap-4">
            <div className="mb-4 flex flex-col gap-1">
                <Text as="h2" variant="lg" weight="bold">
                    {title}
                </Text>
                {description !== undefined ? (
                    <Text variant="sm" className="text-muted-foreground">
                        {description}
                    </Text>
                ) : null}
            </div>
            {children}
        </section>
    )
}

function InfoStep({
    values,
    errors,
    categories,
    onChange,
}: {
    values: ProductInfoFormValues
    errors: Record<string, string>
    categories: Array<{ id: string; name: string }>
    onChange: (patch: Partial<ProductInfoFormValues>) => void
}) {
    return (
        <div className="flex flex-col gap-4">
            <Field>
                <FieldLabel htmlFor="product-name">
                    Nama Produk <span className="text-red-600">*</span>
                </FieldLabel>
                <Input
                    id="product-name"
                    value={values.name}
                    onChange={(event) => onChange({ name: event.target.value })}
                    placeholder="cth. Ayam Geprek"
                    aria-invalid={errors.name !== undefined}
                    className="h-11"
                />
                {errors.name !== undefined ? <FieldError>{errors.name}</FieldError> : null}
            </Field>

            <Field>
                <FieldLabel htmlFor="product-category">
                    Kategori Produk<span className="text-red-600">*</span>
                </FieldLabel>
                <Select
                    value={values.category_id === "" ? "" : values.category_id}
                    onValueChange={(value) => onChange({ category_id: value ?? "" })}
                >
                    <SelectTrigger
                        id="product-category"
                        className="h-11 w-full"
                        aria-invalid={errors.category_id !== undefined}
                    >
                        <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id} className="p-3">
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.category_id !== undefined ? <FieldError>{errors.category_id}</FieldError> : null}
            </Field>

            <Field>
                <FieldLabel htmlFor="product-description">Deskripsi</FieldLabel>
                <Textarea
                    id="product-description"
                    value={values.description ?? ""}
                    onChange={(event) => onChange({ description: event.target.value })}
                    placeholder="cth. Ayam goreng crispy dengan sambal khas JualAntar."
                    rows={3}
                    aria-invalid={errors.description !== undefined}
                />
                {errors.description !== undefined ? <FieldError>{errors.description}</FieldError> : null}
            </Field>

            <div className="flex flex-col gap-2">
                <FieldLabel id="product-type-label">
                    Tipe Produk <span className="text-red-600">*</span>
                </FieldLabel>
                <RadioGroup
                    value={values.product_type}
                    onValueChange={(value) => onChange({ product_type: value as ProductType })}
                    aria-labelledby="product-type-label"
                    className="gap-2"
                >
                    {(["simple", "variable"] as const).map((type) => (
                        <label
                            key={type}
                            className={cn(
                                "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/50",
                                values.product_type === type && "border-primary bg-primary/5"
                            )}
                        >
                            <RadioGroupItem value={type} id={`product-type-${type}`} />
                            <span className="flex min-w-0 flex-col gap-0.5">
                                <Text variant="sm" weight="semibold">
                                    {PRODUCT_TYPE_FORM_LABEL[type]}
                                </Text>
                                <Text variant="xs" className="text-muted-foreground">
                                    {type === "simple" ? "Satu harga untuk seluruh produk" : "Harga per variant"}
                                </Text>
                            </span>
                        </label>
                    ))}
                </RadioGroup>
                {errors.product_type !== undefined ? <FieldError>{errors.product_type}</FieldError> : null}
            </div>
        </div>
    )
}

export function ProductNewPage() {
    const navigate = useNavigate()
    const createBundle = useCreateProductBundle()

    const categoriesQuery = useCategories({ status: "active", per_page: 100, sort: "name", order: "asc" })
    const outletsQuery = useOutlets()

    const [stepIndex, setStepIndex] = useState(0)
    const [info, setInfo] = useState<ProductInfoFormValues>({
        name: "",
        category_id: "",
        description: "",
        product_type: "simple",
    })
    const [infoErrors, setInfoErrors] = useState<Record<string, string>>({})
    const [priceRaw, setPriceRaw] = useState("")
    const [priceErrors, setPriceErrors] = useState<Record<string, string>>({})
    const [variants, setVariants] = useState<VariantDraft[]>([])
    const [groups, setGroups] = useState<GroupDraft[]>([])
    const [media, setMedia] = useState<MediaDraft[]>([])
    const [outletIds, setOutletIds] = useState<string[]>([])
    const [stepError, setStepError] = useState<string | null>(null)
    const [expandedReview, setExpandedReview] = useState<string | null>(null)

    const step = STEPS[stepIndex]
    const categories = categoriesQuery.data?.data ?? []
    const outlets = outletsQuery.data ?? []
    const isPending = createBundle.isPending

    function patchInfo(patch: Partial<ProductInfoFormValues>) {
        setInfo((current) => ({ ...current, ...patch }))
        setInfoErrors({})
        setStepError(null)
    }

    function validateInfo(): boolean {
        const parsed = productInfoSchema.safeParse(info)

        if (!parsed.success) {
            setInfoErrors(issuesToMessages(parsed.error.issues))
            return false
        }

        setInfoErrors({})
        setInfo(parsed.data)
        return true
    }

    function validatePrice(): boolean {
        if (info.product_type === "variable") {
            if (variants.length === 0) {
                setStepError("Tambahkan minimal satu variant.")
                return false
            }

            setStepError(null)
            return true
        }

        const parsed = simplePriceSchema.safeParse({ price: priceRaw })

        if (!parsed.success) {
            setPriceErrors(issuesToMessages(parsed.error.issues))
            return false
        }

        setPriceErrors({})
        setPriceRaw(String(parsed.data.price))
        return true
    }

    function handleNext() {
        if (step.id === "info" && !validateInfo()) {
            return
        }

        if (step.id === "price" && !validatePrice()) {
            return
        }

        setStepError(null)
        setStepIndex((index) => Math.min(index + 1, STEPS.length - 1))
    }

    function handleBack() {
        setStepError(null)
        setStepIndex((index) => Math.max(index - 1, 0))
    }

    function handleSave() {
        if (!validateInfo() || !validatePrice()) {
            return
        }

        const price = info.product_type === "simple" ? Number(priceRaw) : null

        createBundle.mutate(
            {
                product: {
                    category_id: info.category_id,
                    name: info.name,
                    description: info.description ?? null,
                    product_type: info.product_type,
                    price,
                },
                variants:
                    info.product_type === "variable"
                        ? variants.map((variant) => ({
                              name: variant.name,
                              sku: variant.sku === "" ? null : variant.sku,
                              price: variant.price,
                              is_default: variant.is_default,
                          }))
                        : [],
                modifierGroups: groups.map((group) => ({
                    group: {
                        name: group.name,
                        description: group.description === "" ? null : group.description,
                        selection_type: group.selection_type,
                        min_selection: group.min_selection,
                        max_selection: group.max_selection,
                        is_required: group.is_required,
                    },
                    modifiers: group.modifiers.map((modifier) => ({
                        name: modifier.name,
                        description: modifier.description === "" ? null : modifier.description,
                        price: modifier.price,
                        is_default: modifier.is_default,
                    })),
                })),
                media: media.map((item) => ({
                    url: item.url,
                    alt_text: item.alt_text === "" ? null : item.alt_text,
                    mime_type: "image/svg+xml",
                    is_primary: item.is_primary,
                })),
                outletIds,
            },
            {
                onSuccess: (product) => {
                    notifySuccess("Produk dibuat", `"${product.name}" ditambahkan ke katalog.`)
                    void navigate(CATALOGS_PATHS.detail(product.id))
                },
                onError: () => notifyError("Gagal membuat produk"),
            }
        )
    }

    const reviewSections = [
        {
            id: "info",
            title: "Informasi",
            summary: [
                info.name,
                categories.find((category) => category.id === info.category_id)?.name ?? "Tanpa kategori",
            ]
                .filter((part) => part !== "")
                .join(" • "),
            content: (
                <dl className="flex flex-col divide-y rounded-xl border">
                    {[
                        { term: "Nama", value: info.name || "-" },
                        {
                            term: "Kategori",
                            value: categories.find((category) => category.id === info.category_id)?.name ?? "-",
                        },
                        { term: "Deskripsi", value: info.description ?? "-" },
                        { term: "Tipe produk", value: PRODUCT_TYPE_LABEL[info.product_type] },
                        {
                            term: "Harga",
                            value:
                                info.product_type === "simple"
                                    ? formatCurrency(Number(priceRaw))
                                    : variants.length > 0
                                      ? `Mulai ${formatCurrency(Math.min(...variants.map((variant) => variant.price)))}`
                                      : "-",
                        },
                    ].map((row) => (
                        <div key={row.term} className="flex items-start justify-between gap-4 px-3 py-2">
                            <dt className="shrink-0 text-sm text-muted-foreground">{row.term}</dt>
                            <dd className="text-right text-sm font-medium wrap-break-word">{row.value}</dd>
                        </div>
                    ))}
                </dl>
            ),
        },
        {
            id: "variant",
            title: info.product_type === "simple" ? "Harga" : "Variant",
            summary: info.product_type === "simple" ? formatCurrency(Number(priceRaw)) : `${variants.length} variant`,
            content:
                info.product_type === "simple" ? (
                    <Text variant="sm">{formatCurrency(Number(priceRaw))}</Text>
                ) : (
                    <ul className="flex flex-col gap-1.5">
                        {variants.map((variant) => (
                            <li
                                key={variant.key}
                                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                            >
                                <Text variant="sm" truncate>
                                    {variant.name}
                                    {variant.is_default ? " (default)" : ""}
                                </Text>
                                <Text variant="sm" className="shrink-0">
                                    {formatCurrency(variant.price)}
                                </Text>
                            </li>
                        ))}
                    </ul>
                ),
        },
        {
            id: "customization",
            title: "Customization",
            summary: groups.length > 0 ? `${groups.length} modifier group` : "Tidak ada customization",
            content: (
                <div className="flex flex-col gap-3">
                    {groups.length === 0 ? (
                        <Text variant="sm" className="text-muted-foreground">
                            Tidak ada modifier group.
                        </Text>
                    ) : (
                        groups.map((group) => (
                            <div key={group.key} className="rounded-xl border p-3">
                                <Text variant="sm" weight="semibold">
                                    {group.name}
                                </Text>
                                <Text variant="xs" className="text-muted-foreground">
                                    {group.modifiers.length} modifier • {group.is_required ? "Wajib" : "Opsional"}
                                </Text>
                            </div>
                        ))
                    )}
                </div>
            ),
        },
        {
            id: "media",
            title: "Media",
            summary: `${media.length} foto`,
            content: (
                <div className="flex flex-wrap gap-2">
                    {media.length === 0 ? (
                        <Text variant="sm" className="text-muted-foreground">
                            Belum ada foto.
                        </Text>
                    ) : (
                        media.map((item) => (
                            <div key={item.key} className="relative size-16 overflow-hidden rounded-lg border bg-muted">
                                <img src={item.url} alt={item.alt_text} className="size-full object-cover" />
                            </div>
                        ))
                    )}
                </div>
            ),
        },
        {
            id: "outlet",
            title: "Outlet",
            summary: `${outletIds.length} outlet`,
            content: (
                <ul className="flex flex-col gap-1.5">
                    {outletIds.length === 0 ? (
                        <Text variant="sm" className="text-muted-foreground">
                            Belum ada outlet dipilih.
                        </Text>
                    ) : (
                        outlets
                            .filter((outlet) => outletIds.includes(outlet.id))
                            .map((outlet) => (
                                <li key={outlet.id} className="rounded-lg border px-3 py-2">
                                    <Text variant="sm">{outlet.name}</Text>
                                </li>
                            ))
                    )}
                </ul>
            ),
        },
    ]

    if (categoriesQuery.isPending) {
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

            <div className="mt-2 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                    <Text variant="xs" weight="semibold" className="text-muted-foreground">
                        Langkah {stepIndex + 1} dari {STEPS.length}
                    </Text>
                    <Text variant="xs" weight="semibold">
                        {step.label}
                    </Text>
                </div>

                <div className="flex gap-1.5" aria-hidden="true">
                    {STEPS.map((item, index) => (
                        <span
                            key={item.id}
                            className={cn(
                                "h-1.5 flex-1 rounded-full transition-colors",
                                index <= stepIndex ? "bg-primary" : "bg-muted"
                            )}
                        />
                    ))}
                </div>
            </div>

            <div className="flex flex-1 flex-col rounded-2xl">
                {step.id === "info" ? (
                    <StepShell title="Informasi produk" description="Nama, kategori, dan tipe produk.">
                        <InfoStep values={info} errors={infoErrors} categories={categories} onChange={patchInfo} />
                    </StepShell>
                ) : null}

                {step.id === "price" ? (
                    <StepShell
                        title={info.product_type === "simple" ? "Harga" : "Variant"}
                        description={
                            info.product_type === "simple"
                                ? "Produk simple menggunakan satu harga."
                                : "Tambahkan minimal satu variant sebelum melanjutkan."
                        }
                    >
                        {info.product_type === "simple" ? (
                            <Field>
                                <FieldLabel htmlFor="product-price">Harga (Rp)</FieldLabel>
                                <Input
                                    id="product-price"
                                    inputMode="numeric"
                                    value={priceRaw}
                                    onChange={(event) => {
                                        setPriceRaw(event.target.value)
                                        setPriceErrors({})
                                        setStepError(null)
                                    }}
                                    placeholder="cth. 18000"
                                    aria-invalid={priceErrors.price !== undefined}
                                    className="h-11"
                                />
                                {priceErrors.price !== undefined ? <FieldError>{priceErrors.price}</FieldError> : null}
                            </Field>
                        ) : (
                            <VariantDraftEditor variants={variants} onChange={setVariants} />
                        )}
                    </StepShell>
                ) : null}

                {step.id === "customization" ? (
                    <StepShell
                        title="Customization"
                        description="Tambahkan pilihan yang dapat dipilih pelanggan. Opsional."
                    >
                        <GroupDraftEditor groups={groups} onChange={setGroups} />
                    </StepShell>
                ) : null}

                {step.id === "media" ? (
                    <StepShell title="Foto Produk" description="Pilih foto dummy untuk produk.">
                        <MediaDraftPicker media={media} onChange={setMedia} />
                    </StepShell>
                ) : null}

                {step.id === "outlet" ? (
                    <StepShell title="Outlet" description="Pilih outlet tempat produk ini dijual.">
                        {outletsQuery.isPending ? (
                            <ListSkeleton rows={2} className="h-16" />
                        ) : outletsQuery.isError ? (
                            <ErrorState title="Gagal memuat outlet" onRetry={() => void outletsQuery.refetch()} />
                        ) : (
                            <OutletDraftPicker outlets={outlets} selectedIds={outletIds} onChange={setOutletIds} />
                        )}
                    </StepShell>
                ) : null}

                {step.id === "review" ? (
                    <StepShell title="Review Product" description="Periksa kembali sebelum menyimpan.">
                        <div className="flex flex-col gap-3">
                            {reviewSections.map((section) => (
                                <ReviewSection
                                    key={section.id}
                                    title={section.title}
                                    summary={section.summary}
                                    expanded={expandedReview === section.id}
                                    onToggle={() =>
                                        setExpandedReview((current) => (current === section.id ? null : section.id))
                                    }
                                >
                                    {section.content}
                                </ReviewSection>
                            ))}
                        </div>
                    </StepShell>
                ) : null}

                {stepError !== null ? (
                    <p role="alert" className="mt-4 text-sm font-semibold text-destructive">
                        {stepError}
                    </p>
                ) : null}
            </div>

            <div className="sticky bottom-0 -mx-1 flex gap-2 border-t bg-background/95 px-1 py-3 backdrop-blur">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1 font-semibold"
                    disabled={isPending || stepIndex === 0}
                    onClick={handleBack}
                    size="lg"
                >
                    <MoveLeft />
                    Kembali
                </Button>

                {step.id === "review" ? (
                    <Button type="button" className="flex-1" size="lg" disabled={isPending} onClick={handleSave}>
                        {isPending ? (
                            <>
                                <Spinner /> Menyimpan…
                            </>
                        ) : (
                            "Simpan Produk"
                        )}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        className="flex-1 font-semibold"
                        size="lg"
                        disabled={isPending}
                        onClick={handleNext}
                    >
                        Lanjut
                        <MoveRight />
                    </Button>
                )}
            </div>
        </div>
    )
}
