import { BundleStatusPanel } from "../bundle-status-panel"
import { ProductReviewSections } from "../product-review-sections"
import { WizardStepShell } from "../wizard-step-shell"
import type { BundleStep } from "../../../services/product-bundle/product-bundle.mutation"
import type { ProductInfoFormValues } from "../../../schemas"
import type { CatalogOutlet } from "../../../types"
import type { GroupDraft, MediaDraft, VariantDraft } from "../../../types/product-draft.types"

/**
 * The last look before anything is created, and the place a half-finished
 * create is reported.
 *
 * The status panel is deliberately part of this step rather than a toast: a
 * create is several requests in sequence, and the merchant needs to see which
 * one failed to retry only that one.
 */
export function ReviewStep({
    info,
    priceRaw,
    variants,
    groups,
    media,
    outlets,
    outletIds,
    categories,
    expandedId,
    onToggle,
    status,
}: {
    info: ProductInfoFormValues
    priceRaw: string
    variants: VariantDraft[]
    groups: GroupDraft[]
    media: MediaDraft[]
    outlets: CatalogOutlet[]
    outletIds: string[]
    categories: Array<{ id: string; name: string }>
    expandedId: string | null
    onToggle: (id: string) => void
    status: {
        steps: BundleStep[]
        hasFailure: boolean
        firstFailedError: unknown
        isPending: boolean
        productId: string | null
        onRetry: () => void
    } | null
}) {
    return (
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
                expandedId={expandedId}
                onToggle={onToggle}
            />

            {status !== null ? (
                <BundleStatusPanel
                    steps={status.steps}
                    hasFailure={status.hasFailure}
                    firstFailedError={status.firstFailedError}
                    isPending={status.isPending}
                    productId={status.productId}
                    onRetry={status.onRetry}
                />
            ) : null}
        </WizardStepShell>
    )
}
