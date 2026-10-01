import { RotateCcwIcon, StoreIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"

import { ConfirmDialog } from "../common/confirm-dialog"
import { useClearOutletItemOverrides } from "../../services/outlet-overrides/outlet-override.mutations"
import type { OutletOverrideTarget } from "../../services/outlet-overrides/outlet-override.api"
import { catalogErrorMessage } from "../../utils/api-error"
import { notifyError, notifySuccess } from "~/lib/notify"
import type { OutletItemOverride } from "../../types"

/**
 * Which outlets deviated from the master status for one item, and who did it.
 *
 * This is the owner's answer to "what did my outlet managers change?". The list
 * is read-only on purpose: the owner does not manage the override per outlet, they
 * only clear all of them at once, which is the single action that cannot leave the
 * catalog in an inconsistent state.
 *
 * Rendering nothing when there is no override keeps the master detail clean —
 * an item nobody touched shows nothing at all.
 */
export function OutletOverrideList({
    productId,
    itemName,
    itemLabel,
    overrides,
    target,
}: {
    productId: string
    itemName: string
    itemLabel: string
    overrides: OutletItemOverride[] | undefined
    target: OutletOverrideTarget
}) {
    const [confirming, setConfirming] = useState(false)
    const mutation = useClearOutletItemOverrides(productId)

    if (overrides === undefined || overrides.length === 0) {
        return null
    }

    const outletCount = overrides.length

    function runReset() {
        mutation.mutate(target, {
            onSuccess: () => {
                setConfirming(false)
                notifySuccess(`Override outlet dihapus`, `${itemName} kembali mengikuti katalog pusat di semua outlet.`)
            },
            onError: (error) => notifyError(catalogErrorMessage(error, "Gagal menghapus override outlet")),
        })
    }

    return (
        <div className="flex flex-col gap-1.5 rounded-xl border border-dashed bg-muted/40 px-3 py-2">
            <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col gap-0.5">
                    <Text variant="xs" weight="semibold">
                        {itemLabel} di outlet lain
                    </Text>
                    <Text variant="xs" className="text-muted-foreground">
                        Nonaktif di {outletCount} outlet
                    </Text>
                </div>

                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={mutation.isPending}
                    onClick={() => setConfirming(true)}
                >
                    <RotateCcwIcon aria-hidden="true" className="size-4" />
                    Kembalikan
                </Button>
            </div>

            <ul className="flex flex-col gap-1">
                {overrides.map((override) => (
                    <li key={`${override.outlet_id}-${override.subject_type}`} className="flex items-center gap-1.5">
                        <StoreIcon aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" />
                        <Text variant="xs" className="text-muted-foreground" truncate>
                            {override.outlet_name ?? "Outlet"}
                        </Text>
                        {override.deactivated_by !== null ? (
                            <Text variant="xs" className="text-muted-foreground/80" truncate>
                                · {override.deactivated_by.email ?? "tidak diketahui"}
                            </Text>
                        ) : null}
                    </li>
                ))}
            </ul>

            <ConfirmDialog
                open={confirming}
                onOpenChange={(open) => (!open ? setConfirming(false) : undefined)}
                title={`Kembalikan ${itemLabel.toLowerCase()} ke semua outlet?`}
                description={`${itemName} akan kembali mengikuti status katalog pusat di ${outletCount} outlet. Status katalog pusat tidak berubah.`}
                confirmLabel="Kembalikan"
                pendingLabel="Memproses…"
                variant="default"
                isPending={mutation.isPending}
                onConfirm={runReset}
            />
        </div>
    )
}
