import { ProductReviewSections } from "../../product-wizard/product-review-sections"
import { WizardStepShell } from "../../product-wizard/wizard-step-shell"
import { BundleStatusPanel } from "../../product-wizard/bundle-status-panel"
import type { BundleStep } from "../../../services/product-bundle/product-bundle.mutation"
import type { CatalogOutlet, EditForm } from "../../../types"

export function EditReviewStep({
    form,
    outlets,
    categories,
    expandedId,
    onToggle,
    status,
}: {
    form: EditForm
    outlets: CatalogOutlet[]
    categories: Array<{ id: string; name: string }>
    expandedId: string | null
    onToggle: (id: string) => void
    status: {
        steps: BundleStep[]
        hasFailure: boolean
        firstFailedError: unknown
        isPending: boolean
        productId: string
        onRetry: () => void
    } | null
}) {
    return (
        <WizardStepShell title="Review Produk" description="Periksa kembali sebelum menyimpan.">
            <ProductReviewSections
                info={form.info}
                priceRaw={form.priceRaw}
                variants={form.variants}
                groups={form.groups}
                media={form.media}
                outlets={outlets}
                outletIds={form.outletIds}
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
