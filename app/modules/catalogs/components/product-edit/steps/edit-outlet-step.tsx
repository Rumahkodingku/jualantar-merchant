import { ErrorState } from "~/components/error-state"
import { ListSkeleton } from "~/components/list-skeleton"
import { Text } from "~/components/ui/text"

import { OutletAssignments } from "../../outlets/outlet-assignments"
import { OutletDraftPicker } from "../../product-wizard/outlet-draft-picker"
import { WizardStepShell } from "../../product-wizard/wizard-step-shell"
import type { CatalogOutlet, OutletProductAssignment } from "../../../types"

/**
 * The outlet step of an edit.
 *
 * Two halves, and the split is the point. The picker on top answers "which
 * outlets does this product belong in" and is held in the form until the product
 * is saved, because choosing is part of the same edit as everything else. The
 * rows underneath answer what can only be asked of one outlet at a time — is the
 * assignment live, is the product in stock there — and those are written the
 * moment the merchant changes them, since there is no sense in making someone
 * re-save a product to mark one of its outlets out of stock.
 */
export function EditOutletStep({
    productId,
    outlets,
    assignments,
    isPending,
    isError,
    selectedIds,
    onChange,
    onRemove,
    onRetry,
}: {
    productId: string
    outlets: CatalogOutlet[]
    /** The assignments the API last reported, for the per-outlet rows. */
    assignments: OutletProductAssignment[]
    isPending: boolean
    isError: boolean
    selectedIds: string[]
    onChange: (ids: string[]) => void
    onRemove: (outletId: string) => void
    onRetry: () => void
}) {
    // Only the outlets the product is still assigned to get a row; one the
    // merchant has just unticked is on its way out and does not need controls.
    const live = assignments.filter((assignment) => selectedIds.includes(assignment.outlet_id))

    return (
        <WizardStepShell title="Outlet" description="Pilih outlet tempat produk ini dijual.">
            {isPending ? (
                <ListSkeleton rows={2} className="h-16" />
            ) : isError ? (
                <ErrorState title="Gagal memuat outlet" onRetry={onRetry} />
            ) : (
                <div className="flex flex-col gap-4">
                    <OutletDraftPicker outlets={outlets} selectedIds={selectedIds} onChange={onChange} />

                    {live.length > 0 ? (
                        <div className="flex flex-col gap-3 border-t pt-4">
                            <Text variant="sm" weight="medium">
                                Status per outlet
                            </Text>
                            <Text variant="xs" className="text-muted-foreground">
                                Penugasan = produk ditugaskan ke outlet. Availability = produk sedang tersedia.
                            </Text>

                            <OutletAssignments productId={productId} assignments={live} onRemove={onRemove} />
                        </div>
                    ) : null}
                </div>
            )}
        </WizardStepShell>
    )
}
