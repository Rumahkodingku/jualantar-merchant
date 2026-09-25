import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"
import { MoveLeft, MoveRight } from "lucide-react"

import { ErrorState } from "~/components/error-state"
import { SubpageHeader } from "~/components/layouts/subpage-header"
import { Button } from "~/components/ui/button"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

import { ListSkeleton } from "~/components/list-skeleton"
import {
    BundleStatusPanel,
    MediaDraftPicker,
    ModifierGroupDraftEditor,
    OutletDraftPicker,
    ProductInfoStep,
    ProductReviewSections,
    STEPS,
    VariantDraftEditor,
    WizardStepShell,
    type GroupDraft,
    type MediaDraft,
    type VariantDraft,
} from "../components/product-wizard"
import { useCreateProductBundle } from "../services/product-bundle/product-bundle.mutation"
import { useCategories } from "../services/categories/category.queries"
import { useOutlets } from "../services/product-outlets/product-outlet.queries"
import { productInfoSchema, simplePriceSchema, type ProductInfoFormValues } from "../schemas/catalog.schema"
import { issuesToMessages } from "../utils/issues"
import { notifySuccess } from "~/lib/notify"
import { CATALOGS_PATHS } from "../utils/paths"

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
    const savedRef = useRef(false)

    const step = STEPS[stepIndex]
    const saveAttempted = createBundle.steps.some((entry) => entry.status !== "pending")
    const firstFailedError = createBundle.steps.find((entry) => entry.status === "failed")?.error
    const categories = categoriesQuery.data?.data ?? []
    const outlets = outletsQuery.data ?? []
    const isPending = createBundle.isPending

    useEffect(() => {
        if (createBundle.isPending || createBundle.hasFailure || createBundle.productId === null) {
            return
        }

        const allSettled = createBundle.steps.every((entry) => entry.status === "success" || entry.status === "skipped")

        if (!allSettled || savedRef.current) {
            return
        }

        savedRef.current = true
        notifySuccess("Produk dibuat", `"${info.name}" ditambahkan ke katalog.`)
        void navigate(CATALOGS_PATHS.detail(createBundle.productId))
    }, [createBundle, info.name, navigate])

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

        createBundle.start({
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
                file: item.file,
                alt_text: item.alt_text === "" ? null : item.alt_text,
                is_primary: item.is_primary,
            })),
            outletIds,
        })
    }

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
                    <WizardStepShell title="Informasi produk" description="Nama, kategori, dan tipe produk.">
                        <ProductInfoStep
                            values={info}
                            errors={infoErrors}
                            categories={categories}
                            onChange={patchInfo}
                        />
                    </WizardStepShell>
                ) : null}

                {step.id === "price" ? (
                    <WizardStepShell
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
                    </WizardStepShell>
                ) : null}

                {step.id === "customization" ? (
                    <WizardStepShell
                        title="Customization"
                        description="Tambahkan pilihan yang dapat dipilih pelanggan. Opsional."
                    >
                        <ModifierGroupDraftEditor groups={groups} onChange={setGroups} />
                    </WizardStepShell>
                ) : null}

                {step.id === "media" ? (
                    <WizardStepShell
                        title="Foto Produk"
                        description="Pilih foto produk. Unggahan diproses saat produk disimpan."
                    >
                        <MediaDraftPicker media={media} onChange={setMedia} />
                    </WizardStepShell>
                ) : null}

                {step.id === "outlet" ? (
                    <WizardStepShell title="Outlet" description="Pilih outlet tempat produk ini dijual.">
                        {outletsQuery.isPending ? (
                            <ListSkeleton rows={2} className="h-16" />
                        ) : outletsQuery.isError ? (
                            <ErrorState title="Gagal memuat outlet" onRetry={() => void outletsQuery.refetch()} />
                        ) : (
                            <OutletDraftPicker outlets={outlets} selectedIds={outletIds} onChange={setOutletIds} />
                        )}
                    </WizardStepShell>
                ) : null}

                {step.id === "review" ? (
                    <WizardStepShell title="Review Product" description="Periksa kembali sebelum menyimpan.">
                        <ProductReviewSections
                            info={info}
                            priceRaw={priceRaw}
                            variants={variants}
                            groups={groups}
                            media={media}
                            outlets={outlets}
                            outletIds={outletIds}
                            categories={categories}
                            expandedId={expandedReview}
                            onToggle={(id) => setExpandedReview((current) => (current === id ? null : id))}
                        />

                        {saveAttempted ? (
                            <BundleStatusPanel
                                steps={createBundle.steps}
                                hasFailure={createBundle.hasFailure}
                                firstFailedError={firstFailedError}
                                isPending={createBundle.isPending}
                                productId={createBundle.productId}
                                onRetry={createBundle.retry}
                            />
                        ) : null}
                    </WizardStepShell>
                ) : null}

                {stepError !== null ? (
                    <p role="alert" className="mt-4 text-sm font-semibold text-destructive">
                        {stepError}
                    </p>
                ) : null}
            </div>

            <div className="sticky bottom-0 -mx-1 flex gap-2 px-1 py-3 backdrop-blur">
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
