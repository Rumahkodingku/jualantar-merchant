import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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

import { ConfirmDialog } from "../components/common/confirm-dialog"
import { ListSkeleton } from "~/components/list-skeleton"
import {
    BundleStatusPanel,
    DraftConflictAlert,
    DraftResumeBanner,
    DraftSaveIndicator,
    MediaDraftPicker,
    ModifierGroupDraftEditor,
    OutletDraftPicker,
    ProductInfoStep,
    ProductReviewSections,
    STEPS,
    VariantDraftEditor,
    WizardStepShell,
} from "../components/product-wizard"
import { useCreateProductBundle, type ProductBundleInput } from "../services/product-bundle/product-bundle.mutation"
import { useCategories } from "../services/categories/category.queries"
import { useOutlets } from "../services/product-outlets/product-outlet.queries"
import { useProductDraft } from "../hooks/use-product-draft"
import { productInfoSchema, simplePriceSchema, type ProductInfoFormValues } from "../schemas/catalog.schema"
import { issuesToMessages } from "../utils/issues"
import { notifySuccess } from "~/lib/notify"
import { CATALOGS_PATHS } from "../utils/paths"

export function ProductNewPage() {
    const navigate = useNavigate()

    const categoriesQuery = useCategories({ status: "active", per_page: 100, sort: "name", order: "asc" })
    const outletsQuery = useOutlets()

    const [submitting, setSubmitting] = useState(false)
    const draft = useProductDraft({ autosave: !submitting })
    const createBundle = useCreateProductBundle(draft.submission)

    const [infoErrors, setInfoErrors] = useState<Record<string, string>>({})
    const [priceErrors, setPriceErrors] = useState<Record<string, string>>({})
    const [stepError, setStepError] = useState<string | null>(null)
    const [expandedReview, setExpandedReview] = useState<string | null>(null)
    const [confirmDiscard, setConfirmDiscard] = useState(false)
    const [bannerDismissed, setBannerDismissed] = useState(false)
    const [reconciled, setReconciled] = useState(false)
    const savedRef = useRef(false)

    const step = STEPS[draft.stepIndex] ?? STEPS[0]
    const saveAttempted = createBundle.hasStarted
    const firstFailedError = createBundle.steps.find((entry) => entry.status === "failed")?.error
    const categories = useMemo(() => categoriesQuery.data?.data ?? [], [categoriesQuery.data])
    const outlets = useMemo(() => outletsQuery.data ?? [], [outletsQuery.data])
    const isPending = createBundle.isPending
    const submissionKey = JSON.stringify(createBundle.progress())
    const setReconcileNotice = draft.setReconcileNotice
    const setOutletIds = draft.setOutletIds
    const discard = draft.discard
    const infoCategoryId = draft.info.category_id

    // Autosave has to stand down for the duration of a create, and the hook
    // cannot see the bundle state, so the two are wired together here.
    useEffect(() => {
        setSubmitting(createBundle.isPending)
    }, [createBundle.isPending])

    // Persist the create cursors the moment a step settles, so a reload between
    // two bundle steps resumes instead of starting a second product. Comparing
    // the serialised form keeps this to one write per actual change, and nothing
    // is written before a create has actually started.
    useEffect(() => {
        if (!draft.hydrated || !createBundle.hasStarted) {
            return
        }

        draft.setSubmission(JSON.parse(submissionKey))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [submissionKey, draft.hydrated, createBundle.hasStarted])

    useEffect(() => {
        if (createBundle.isPending || createBundle.hasFailure || createBundle.productId === null) {
            return
        }

        const allSettled = createBundle.steps.every((entry) => entry.status === "success" || entry.status === "skipped")

        if (!allSettled || savedRef.current) {
            return
        }

        savedRef.current = true
        notifySuccess("Produk dibuat", `"${draft.info.name}" ditambahkan ke katalog.`)
        void discard()
        void navigate(CATALOGS_PATHS.detail(createBundle.productId))
        // `draft` is intentionally excluded: the navigation above ends the route, and
        // re-running on a draft change would re-fire the toast.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [createBundle, draft.info.name, navigate])

    /**
     * A draft can be days old, so the category or the outlets it references may
     * be gone by the time the merchant comes back. Drop what cannot be honoured
     * and say so, rather than failing validation on submit with no explanation.
     */
    useEffect(() => {
        if (reconciled || !draft.hydrated || categoriesQuery.isPending || outletsQuery.isPending) {
            return
        }

        setReconciled(true)
        const dropped: string[] = []
        const selected = draft.outletIds

        if (selected.length > 0) {
            const available = new Set(outlets.map((outlet) => outlet.id))
            const kept = selected.filter((id) => available.has(id))

            if (kept.length !== selected.length) {
                dropped.push(`${selected.length - kept.length} outlet`)
                setOutletIds(kept)
            }
        }

        if (infoCategoryId !== "" && !categories.some((item) => item.id === infoCategoryId)) {
            setInfoErrors((current) => ({
                ...current,
                category_id: "Kategori pada draft sudah tidak tersedia. Pilih kategori lain.",
            }))
        }

        if (dropped.length > 0) {
            setReconcileNotice(`${dropped.join(" dan ")} pada draft sudah tidak tersedia dan dilepas.`)
        }
    }, [
        categories,
        categoriesQuery.isPending,
        draft.hydrated,
        draft.outletIds,
        infoCategoryId,
        outlets,
        outletsQuery.isPending,
        reconciled,
        setOutletIds,
        setReconcileNotice,
    ])

    // base-ui mirrors handler props into an internal store, so a new function
    // identity on every render makes it re-render from its own store forever.
    // Every handler handed to a base-ui component is therefore pinned.
    const clearErrors = useCallback(() => {
        setInfoErrors({})
        setStepError(null)
    }, [])

    const patchInfo = useCallback(
        (patch: Partial<ProductInfoFormValues>) => {
            draft.patchInfo(patch)
            setInfoErrors({})
            setStepError(null)
        },
        [draft.patchInfo]
    )

    function validateInfo(): boolean {
        const parsed = productInfoSchema.safeParse({
            ...draft.info,
            description: draft.info.description ?? "",
        })

        if (!parsed.success) {
            setInfoErrors(issuesToMessages(parsed.error.issues))
            return false
        }

        setInfoErrors({})
        return true
    }

    function validatePrice(): boolean {
        if (draft.info.product_type === "variable") {
            if (draft.variants.length === 0) {
                setStepError("Tambahkan minimal satu variant.")
                return false
            }

            setStepError(null)
            return true
        }

        const parsed = simplePriceSchema.safeParse({ price: draft.priceRaw })

        if (!parsed.success) {
            setPriceErrors(issuesToMessages(parsed.error.issues))
            return false
        }

        setPriceErrors({})
        return true
    }

    const handleNext = useCallback(() => {
        if (step.id === "info" && !validateInfo()) {
            return
        }

        if (step.id === "price" && !validatePrice()) {
            return
        }

        setStepError(null)
        draft.setStepIndex(Math.min(draft.stepIndex + 1, STEPS.length - 1))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [draft.setStepIndex, draft.stepIndex, step.id])

    const handleBack = useCallback(() => {
        setStepError(null)
        draft.setStepIndex(Math.max(draft.stepIndex - 1, 0))
    }, [draft.setStepIndex, draft.stepIndex])

    const handleToggleReview = useCallback((id: string) => {
        setExpandedReview((current) => (current === id ? null : id))
    }, [])

    const handleDiscard = useCallback(() => {
        setConfirmDiscard(false)
        setBannerDismissed(false)
        void discard()
    }, [discard])

    const openDiscard = useCallback(() => setConfirmDiscard(true), [])
    const dismissBanner = useCallback(() => setBannerDismissed(true), [])
    const reloadServer = useCallback(() => void draft.reloadFromServer(), [draft.reloadFromServer])
    const selectFile = useCallback((file: File) => void draft.addMedia(file), [draft.addMedia])
    const dropFile = useCallback((key: string) => void draft.deleteMedia(key), [draft.deleteMedia])
    const refreshPreviews = useCallback(() => void draft.refreshPreviewUrls(), [draft.refreshPreviewUrls])
    const changePrice = useCallback(
        (value: string) => {
            draft.setPriceRaw(value)
            setPriceErrors({})
            setStepError(null)
        },
        [draft.setPriceRaw]
    )

    /**
     * The create payload as the form stands right now. Rebuilt on every retry
     * rather than remembered, so edits made after a failure are included and a
     * retry still works after a reload wiped the in-memory input.
     */
    function buildBundleInput(): ProductBundleInput {
        const price = draft.info.product_type === "simple" ? Number(draft.priceRaw) : null

        return {
            product: {
                category_id: draft.info.category_id ?? "",
                name: draft.info.name,
                description: draft.info.description ?? null,
                product_type: draft.info.product_type,
                price,
            },
            variants:
                draft.info.product_type === "variable"
                    ? draft.variants.map((variant) => ({
                          name: variant.name,
                          sku: variant.sku === "" ? null : variant.sku,
                          price: variant.price,
                          is_default: variant.is_default,
                      }))
                    : [],
            modifierGroups: draft.groups.map((group) => ({
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
            media: draft.media
                .filter((item) => item.status === "ready")
                .map((item) => ({
                    object_key: item.object_key,
                    alt_text: item.alt_text === "" ? null : item.alt_text,
                    is_primary: item.is_primary,
                })),
            outletIds: draft.outletIds,
        }
    }

    function handleSave() {
        if (!validateInfo() || !validatePrice()) {
            return
        }

        createBundle.start(buildBundleInput())
    }

    if (draft.status === "loading" || categoriesQuery.isPending) {
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

    if (draft.status === "error") {
        return (
            <ErrorState
                title="Gagal memuat draft"
                description="Isian yang tersimpan tidak dapat dimuat. Coba lagi sebelum mengisi ulang."
                onRetry={() => void draft.refetch()}
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

            {draft.isResumed && !bannerDismissed ? (
                <DraftResumeBanner
                    updatedAt={draft.updatedAt}
                    stepLabel={step.label}
                    reconcileNotice={draft.reconcileNotice}
                    onDiscard={openDiscard}
                    onDismiss={dismissBanner}
                />
            ) : null}

            {draft.conflict !== null ? (
                <DraftConflictAlert
                    onReload={reloadServer}
                    onOverwrite={draft.overwriteConflict}
                    isResolving={draft.saveState === "saving"}
                />
            ) : null}

            {/* Stepper */}
            <div className="mt-2 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                    <Text variant="xs" weight="semibold" className="text-muted-foreground">
                        Langkah {draft.stepIndex + 1} dari {STEPS.length}
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
                                index <= draft.stepIndex ? "bg-primary" : "bg-muted"
                            )}
                        />
                    ))}
                </div>
            </div>

            {/* UI dari setiap step */}
            <div className="flex flex-1 flex-col rounded-2xl">
                {/* ---- Step Info ---- */}
                {step.id === "info" ? (
                    <WizardStepShell title="Informasi produk" description="Nama, kategori, dan tipe produk.">
                        <ProductInfoStep
                            values={draft.info}
                            errors={infoErrors}
                            categories={categories}
                            onChange={patchInfo}
                        />
                    </WizardStepShell>
                ) : null}

                {/* ---- Step Price ---- */}
                {step.id === "price" ? (
                    <WizardStepShell
                        title={draft.info.product_type === "simple" ? "Harga" : "Variant"}
                        description={
                            draft.info.product_type === "simple"
                                ? "Produk simple menggunakan satu harga."
                                : "Tambahkan minimal satu variant sebelum melanjutkan."
                        }
                    >
                        {/* Jika Produk simple */}
                        {draft.info.product_type === "simple" ? (
                            <Field>
                                <FieldLabel htmlFor="product-price">Harga (Rp)</FieldLabel>
                                <Input
                                    id="product-price"
                                    inputMode="numeric"
                                    value={draft.priceRaw}
                                    onChange={(event) => changePrice(event.target.value)}
                                    placeholder="cth. 18000"
                                    aria-invalid={priceErrors.price !== undefined}
                                    className="h-11"
                                />
                                {priceErrors.price !== undefined ? <FieldError>{priceErrors.price}</FieldError> : null}
                            </Field>
                        ) : (
                            // Jika product variant
                            <VariantDraftEditor variants={draft.variants} onChange={draft.setVariants} />
                        )}
                    </WizardStepShell>
                ) : null}

                {step.id === "customization" ? (
                    <WizardStepShell
                        title="Customization"
                        description="Tambahkan pilihan yang dapat dipilih pelanggan. Opsional."
                    >
                        <ModifierGroupDraftEditor groups={draft.groups} onChange={draft.setGroups} />
                    </WizardStepShell>
                ) : null}

                {step.id === "media" ? (
                    <WizardStepShell
                        title="Foto Produk"
                        description="Pilih foto produk. Foto langsung diunggah dan ikut tersimpan di draft."
                    >
                        <MediaDraftPicker
                            media={draft.media}
                            busy={draft.mediaBusy}
                            onSelectFile={selectFile}
                            onRemove={dropFile}
                            onSetPrimary={draft.setPrimaryMedia}
                            onMove={draft.moveMedia}
                            onPreviewError={refreshPreviews}
                        />
                    </WizardStepShell>
                ) : null}

                {step.id === "outlet" ? (
                    <WizardStepShell title="Outlet" description="Pilih outlet tempat produk ini dijual.">
                        {outletsQuery.isPending ? (
                            <ListSkeleton rows={2} className="h-16" />
                        ) : outletsQuery.isError ? (
                            <ErrorState title="Gagal memuat outlet" onRetry={() => void outletsQuery.refetch()} />
                        ) : (
                            <OutletDraftPicker
                                outlets={outlets}
                                selectedIds={draft.outletIds}
                                onChange={draft.setOutletIds}
                            />
                        )}
                    </WizardStepShell>
                ) : null}

                {step.id === "review" ? (
                    <WizardStepShell title="Review Product" description="Periksa kembali sebelum menyimpan.">
                        <ProductReviewSections
                            info={draft.info}
                            priceRaw={draft.priceRaw}
                            variants={draft.variants}
                            groups={draft.groups}
                            media={draft.media}
                            outlets={outlets}
                            outletIds={draft.outletIds}
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
                                onRetry={() => createBundle.retry(buildBundleInput())}
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
                    disabled={isPending || draft.stepIndex === 0}
                    onClick={handleBack}
                    size="lg"
                >
                    <MoveLeft />
                    Kembali
                </Button>

                {step.id === "review" ? (
                    <Button
                        type="button"
                        className="flex-1"
                        size="lg"
                        disabled={isPending || draft.mediaBusy}
                        onClick={handleSave}
                    >
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

            <DraftSaveIndicator state={draft.saveState} onRetry={draft.retrySave} />

            <ConfirmDialog
                open={confirmDiscard}
                onOpenChange={setConfirmDiscard}
                title="Mulai dari awal?"
                description="Draft yang tersimpan akan dihapus dan semua isian dibersihkan. Tindakan ini tidak bisa dibatalkan."
                confirmLabel="Hapus draft"
                onConfirm={() => {
                    setConfirmDiscard(false)
                    setBannerDismissed(false)
                    void discard()
                }}
            />
        </div>
    )
}
