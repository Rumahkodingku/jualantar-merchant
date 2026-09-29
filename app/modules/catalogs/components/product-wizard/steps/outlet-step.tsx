import { ErrorState } from "~/components/error-state"
import { ListSkeleton } from "~/components/list-skeleton"

import { OutletDraftPicker } from "../outlet-draft-picker"
import { WizardStepShell } from "../wizard-step-shell"
import type { CatalogOutlet } from "../../../types"

/**
 * Which outlets this product is sold at. The list comes from the merchant's
 * own outlet directory, so the step has to wait on it and explain itself if
 * that call fails — the merchant cannot be left looking at an empty picker
 * that means "none yet" rather than "we could not ask".
 */
export function OutletStep({
    outlets,
    isPending,
    isError,
    selectedIds,
    onChange,
    onRetry,
}: {
    outlets: CatalogOutlet[]
    isPending: boolean
    isError: boolean
    selectedIds: string[]
    onChange: (ids: string[]) => void
    onRetry: () => void
}) {
    return (
        <WizardStepShell title="Outlet" description="Pilih outlet tempat produk ini dijual.">
            {isPending ? (
                <ListSkeleton rows={2} className="h-16" />
            ) : isError ? (
                <ErrorState title="Gagal memuat outlet" onRetry={onRetry} />
            ) : (
                <OutletDraftPicker outlets={outlets} selectedIds={selectedIds} onChange={onChange} />
            )}
        </WizardStepShell>
    )
}
