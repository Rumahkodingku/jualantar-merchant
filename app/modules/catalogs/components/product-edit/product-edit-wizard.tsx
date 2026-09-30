import { useCallback, useEffect, useState } from "react"
import { MoveLeft, MoveRight } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { notifySuccess } from "~/lib/notify"

import { Stepper } from "../product-wizard/stepper"
import { STEPS } from "../product-wizard/steps"
import { EditCustomizationStep } from "./steps/edit-customization-step"
import { EditInfoStep } from "./steps/edit-info-step"
import { EditMediaStep } from "./steps/edit-media-step"
import { EditOutletStep } from "./steps/edit-outlet-step"
import { EditPriceStep } from "./steps/edit-price-step"
import { EditReviewStep } from "./steps/edit-review-step"
import { useEditMedia } from "../../hooks/use-edit-media"
import { useEditForm } from "../../hooks/use-edit-form"
import { useLeaveGuard } from "../../hooks/use-leave-guard"
import { buildEditPlan } from "../../services/product-edit/build-edit-plan"
import { isPlanEmpty } from "../../services/product-edit/edit-plan.types"
import { useUpdateProductBundle } from "../../services/product-edit/use-update-product-bundle"
import { productInfoSchema, simplePriceSchema, type ProductInfoFormValues } from "../../schemas"
import { issuesToMessages } from "../../utils/issues"
import type { CatalogOutlet, EditForm, EditSnapshot, OutletProductAssignment, ProductType } from "../../types"

interface ProductEditWizardProps {
    productId: string
    productName: string
    productType: ProductType
    categories: Array<{ id: string; name: string }>
    outlets: CatalogOutlet[]
    assignments: OutletProductAssignment[]
    isOutletsPending: boolean
    isOutletsError: boolean
    onRetryOutlets: () => void
    form: EditForm
    snapshot: EditSnapshot
    onSaved: () => void
    onExit: () => void
}

export function ProductEditWizard({
    productId,
    productName,
    productType,
    categories,
    outlets,
    assignments,
    isOutletsPending,
    isOutletsError,
    onRetryOutlets,
    form: initialForm,
    snapshot,
    onSaved,
    onExit,
}: ProductEditWizardProps) {
    const edit = useEditForm({ form: initialForm, snapshot })
    const bundle = useUpdateProductBundle(productId)
    const media = useEditMedia({ productId, form: edit.form, setMedia: edit.setMedia })

    const [infoErrors, setInfoErrors] = useState<Record<string, string>>({})
    const [priceErrors, setPriceErrors] = useState<Record<string, string>>({})
    const [stepError, setStepError] = useState<string | null>(null)
    const [expandedReview, setExpandedReview] = useState<string | null>(null)
    const [isSaved, setIsSaved] = useState(false)

    const step = STEPS[edit.stepIndex] ?? STEPS[0]
    const isSubmitting = bundle.isPending
    const isSimple = edit.form.info.product_type === "simple"

    useEffect(() => {
        if (isSubmitting || !bundle.hasStarted || bundle.hasFailure || !isSaved) {
            return
        }

        if (bundle.steps.every((entry) => entry.status === "success" || entry.status === "skipped")) {
            notifySuccess("Produk diperbarui", `Perubahan pada "${productName}" telah disimpan.`)
            onSaved()
        }
    }, [bundle, isSubmitting, isSaved, onSaved, productName])

    const leaveGuard = useLeaveGuard({ isDirty: edit.isDirty && !isSaved, onDiscard: () => undefined })

    const patchInfo = useCallback(
        (patch: Partial<ProductInfoFormValues>) => {
            edit.patchInfo(patch)
            setInfoErrors({})
            setStepError(null)
        },
        [edit]
    )

    function validateInfo(): boolean {
        const parsed = productInfoSchema.safeParse({
            ...edit.form.info,
            description: edit.form.info.description ?? "",
        })

        if (!parsed.success) {
            setInfoErrors(issuesToMessages(parsed.error.issues))
            return false
        }

        setInfoErrors({})
        return true
    }

    function validatePrice(): boolean {
        if (isSimple) {
            const parsed = simplePriceSchema.safeParse({ price: edit.form.priceRaw })

            if (!parsed.success) {
                setPriceErrors(issuesToMessages(parsed.error.issues))
                return false
            }

            setPriceErrors({})
            return true
        }

        if (edit.form.variants.length === 0) {
            setStepError("Sisakan minimal satu variant.")
            return false
        }

        setPriceErrors({})
        setStepError(null)
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
        edit.setStepIndex(Math.min(edit.stepIndex + 1, STEPS.length - 1))
    }, [edit, isSimple, step.id])

    const handleBack = useCallback(() => {
        setStepError(null)

        if (edit.stepIndex === 0) {
            onExit()
            return
        }

        edit.setStepIndex(edit.stepIndex - 1)
    }, [edit, onExit])

    const changePrice = useCallback(
        (value: string) => {
            edit.setPriceRaw(value)
            setPriceErrors({})
            setStepError(null)
        },
        [edit]
    )

    function handleSave() {
        if (!validateInfo() || !validatePrice()) {
            return
        }

        if (media.mediaBusy) {
            setStepError("Tunggu hingga foto selesai diunggah.")
            return
        }

        const plan = buildEditPlan({ form: edit.form, snapshot: edit.snapshot })

        if (isPlanEmpty(plan)) {
            notifySuccess("Tidak ada perubahan", "Produk sudah tersimpan seperti yang ditampilkan.")
            onSaved()
            return
        }

        setIsSaved(true)
        bundle.start(plan)
    }

    return (
        <>
            <Stepper stepIndex={edit.stepIndex} steps={STEPS} />

            <div className="flex flex-1 flex-col rounded-2xl">
                {step.id === "info" ? (
                    <EditInfoStep
                        values={edit.form.info}
                        errors={infoErrors}
                        categories={categories}
                        productType={productType}
                        onChange={patchInfo}
                    />
                ) : null}

                {step.id === "price" ? (
                    <EditPriceStep
                        isSimple={isSimple}
                        priceRaw={edit.form.priceRaw}
                        priceError={priceErrors.price}
                        variants={edit.form.variants}
                        onPriceChange={changePrice}
                        onVariantsChange={(variants) => {
                            edit.setVariants(variants)
                            setPriceErrors({})
                            setStepError(null)
                        }}
                    />
                ) : null}

                {step.id === "customization" ? (
                    <EditCustomizationStep groups={edit.form.groups} onChange={edit.setGroups} />
                ) : null}

                {step.id === "media" ? (
                    <EditMediaStep
                        media={edit.form.media}
                        busy={media.mediaBusy}
                        onSelectFile={(file) => void media.addMedia(file)}
                        onRemove={media.removeMedia}
                        onSetPrimary={media.setPrimaryMedia}
                        onMove={media.moveMedia}
                        onSetAltText={media.setAltText}
                        onPreviewError={() => void media.refreshMedia()}
                    />
                ) : null}

                {step.id === "outlet" ? (
                    <EditOutletStep
                        productId={productId}
                        outlets={outlets}
                        assignments={assignments}
                        isPending={isOutletsPending}
                        isError={isOutletsError}
                        selectedIds={edit.form.outletIds}
                        onChange={edit.setOutletIds}
                        onRemove={(outletId) => edit.setOutletIds(edit.form.outletIds.filter((id) => id !== outletId))}
                        onRetry={onRetryOutlets}
                    />
                ) : null}

                {step.id === "review" ? (
                    <EditReviewStep
                        form={edit.form}
                        outlets={outlets}
                        categories={categories}
                        expandedId={expandedReview}
                        onToggle={(id) => setExpandedReview((current) => (current === id ? null : id))}
                        status={
                            bundle.hasStarted
                                ? {
                                      steps: bundle.steps,
                                      hasFailure: bundle.hasFailure,
                                      firstFailedError: bundle.steps.find((entry) => entry.status === "failed")?.error,
                                      isPending: bundle.isPending,
                                      productId,
                                      onRetry: bundle.retry,
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
                    disabled={isSubmitting}
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
                        disabled={isSubmitting || media.mediaBusy}
                        onClick={handleSave}
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner /> Menyimpan…
                            </>
                        ) : (
                            "Simpan Perubahan"
                        )}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        className="flex-1 font-semibold"
                        size="lg"
                        disabled={isSubmitting}
                        onClick={handleNext}
                    >
                        Lanjut
                        <MoveRight />
                    </Button>
                )}
            </div>

            {leaveGuard}
        </>
    )
}
