import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { MoveLeft, MoveRight } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"

import { ConfirmDialog } from "../common/confirm-dialog"
import { DraftConflictAlert } from "./draft-conflict-alert"
import { DraftResumeBanner } from "./draft-resume-banner"
import { DraftSaveIndicator } from "./draft-save-indicator"
import { MediaDraftPicker } from "./media-draft-picker"
import { ModifierGroupDraftEditor } from "./modifier-group-draft-editor"
import { OutletStep } from "./steps/outlet-step"
import { PriceStep } from "./steps/price-step"
import { ProductInfoStep } from "./product-info-step"
import { ReviewStep } from "./steps/review-step"
import { STEPS } from "./steps"
import { Stepper } from "./stepper"
import { WizardStepShell } from "./wizard-step-shell"
import { useProductDraft } from "../../hooks/use-product-draft"
import { buildBundleInput } from "../../services/product-bundle/build-bundle-input"
import { useCreateProductBundle } from "../../services/product-bundle/product-bundle.mutation"
import { useCategories } from "../../services/categories/category.queries"
import { useOutlets } from "../../services/product-outlets/product-outlet.queries"
import { issuesToMessages } from "../../utils/issues"
import { productInfoSchema, simplePriceSchema, type ProductInfoFormValues } from "../../schemas"
import { notifySuccess } from "~/lib/notify"

/**
 * The create-product wizard: one step at a time, kept on the server throughout.
 *
 * This owns the three things a page cannot express as markup — which step is
 * showing, whether the form is valid enough to move on, and how a half-finished
 * create is resumed. Everything else it renders is a step component or one of
 * the draft notices around them.
 */
export function ProductWizard({ onCreated }: { onCreated: (productId: string) => void }) {
    const categoriesQuery = useCategories({ status: "active", per_page: 100, sort: "name", order: "asc" })
    const outletsQuery = useOutlets()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const draft = useProductDraft({ autosave: !isSubmitting })
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
    const categories = useMemo(() => categoriesQuery.data?.data ?? [], [categoriesQuery.data])
    const outlets = useMemo(() => outletsQuery.data ?? [], [outletsQuery.data])
    const isPending = createBundle.isPending

    useEffect(() => {
        setIsSubmitting(createBundle.isPending)
    }, [createBundle.isPending])

    const bundleInput = useCallback(
        () =>
            buildBundleInput({
                info: draft.info,
                priceRaw: draft.priceRaw,
                variants: draft.variants,
                groups: draft.groups,
                media: draft.media,
                outletIds: draft.outletIds,
            }),
        [draft.groups, draft.info, draft.media, draft.outletIds, draft.priceRaw, draft.variants]
    )

    /**
     * Persist how far a create got, so a reload mid-save picks up where it left
     * off instead of making a second product. Keyed on the serialised cursors
     * so an effect only re-runs when they actually move.
     */
    const submissionKey = JSON.stringify(createBundle.progress())

    useEffect(() => {
        if (!draft.hydrated || !createBundle.hasStarted) {
            return
        }

        draft.setSubmission(JSON.parse(submissionKey))
    }, [submissionKey, draft.hydrated, draft.setSubmission, createBundle.hasStarted])

    /** Once every step of the create has settled, the product exists. */
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
        void draft.discard()
        onCreated(createBundle.productId)
    }, [createBundle, draft.discard, draft.info.name, onCreated])

    /**
     * A restored draft can point at things that have since been deleted. Drop
     * them rather than offering a product that cannot be saved, and say so once.
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
                draft.setOutletIds(kept)
            }
        }

        if (draft.info.category_id !== "" && !categories.some((item) => item.id === draft.info.category_id)) {
            setInfoErrors((current) => ({
                ...current,
                category_id: "Kategori pada draft sudah tidak tersedia. Pilih kategori lain.",
            }))
        }

        if (dropped.length > 0) {
            draft.setReconcileNotice(`${dropped.join(" dan ")} pada draft sudah tidak tersedia dan dilepas.`)
        }
    }, [categories, categoriesQuery.isPending, draft, infoErrors, outlets, outletsQuery.isPending, reconciled])

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

    /**
     * A variable product needs somewhere for its price to come from, so this
     * checks that at least one variant exists. The rows themselves validate as
     * they are edited, so their values are not re-checked here.
     */
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
    }, [draft.setStepIndex, draft.stepIndex, step.id])

    const handleBack = useCallback(() => {
        setStepError(null)
        draft.setStepIndex(Math.max(draft.stepIndex - 1, 0))
    }, [draft.setStepIndex, draft.stepIndex])

    const changePrice = useCallback(
        (value: string) => {
            draft.setPriceRaw(value)
            setPriceErrors({})
            setStepError(null)
        },
        [draft.setPriceRaw]
    )

    function handleSave() {
        if (!validateInfo() || !validatePrice()) {
            return
        }

        createBundle.start(bundleInput())
    }

    return (
        <>
            {draft.isResumed && !bannerDismissed ? (
                <DraftResumeBanner
                    updatedAt={draft.updatedAt}
                    stepLabel={step.label}
                    reconcileNotice={draft.reconcileNotice}
                    onDiscard={() => setConfirmDiscard(true)}
                    onDismiss={() => setBannerDismissed(true)}
                />
            ) : null}

            {draft.conflict !== null ? (
                <DraftConflictAlert
                    onReload={() => void draft.reloadFromServer()}
                    onOverwrite={draft.overwriteConflict}
                    isResolving={draft.saveState === "saving"}
                />
            ) : null}

            <Stepper stepIndex={draft.stepIndex} />

            <div className="flex flex-1 flex-col rounded-2xl">
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

                {step.id === "price" ? (
                    <PriceStep
                        isSimple={draft.info.product_type === "simple"}
                        priceRaw={draft.priceRaw}
                        priceError={priceErrors.price}
                        variants={draft.variants}
                        onPriceChange={changePrice}
                        onVariantsChange={draft.setVariants}
                    />
                ) : null}

                {step.id === "customization" ? (
                    <WizardStepShell
                        title="Customization"
                        description="Tambahkan pilihan yang dapat dipilih pelanggan (opsional)"
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
                            onSelectFile={(file) => void draft.addMedia(file)}
                            onRemove={(key) => void draft.deleteMedia(key)}
                            onSetPrimary={draft.setPrimaryMedia}
                            onMove={draft.moveMedia}
                            onPreviewError={() => void draft.refreshPreviewUrls()}
                        />
                    </WizardStepShell>
                ) : null}

                {step.id === "outlet" ? (
                    <OutletStep
                        outlets={outlets}
                        isPending={outletsQuery.isPending}
                        isError={outletsQuery.isError}
                        selectedIds={draft.outletIds}
                        onChange={draft.setOutletIds}
                        onRetry={() => void outletsQuery.refetch()}
                    />
                ) : null}

                {step.id === "review" ? (
                    <ReviewStep
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
                        status={
                            saveAttempted
                                ? {
                                      steps: createBundle.steps,
                                      hasFailure: createBundle.hasFailure,
                                      firstFailedError: createBundle.steps.find((entry) => entry.status === "failed")
                                          ?.error,
                                      isPending: createBundle.isPending,
                                      productId: createBundle.productId,
                                      onRetry: () => createBundle.retry(bundleInput()),
                                  }
                                : null
                        }
                    />
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
                    void draft.discard()
                }}
            />
        </>
    )
}
