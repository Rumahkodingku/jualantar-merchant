import { Switch } from "~/components/ui/switch"

import { notifyError, notifySuccess } from "~/lib/notify"
import type { CatalogStatus } from "../../types/catalog.types"

type StatusMutator = (status: CatalogStatus, options: { onSuccess: () => void; onError: () => void }) => void

export function EntityStatusSwitch({
    checked,
    disabled = false,
    ariaLabel,
    successMessage,
    errorMessage = "Gagal memperbarui status",
    setStatus,
}: {
    checked: boolean
    disabled?: boolean
    ariaLabel: string
    successMessage: string
    errorMessage?: string
    setStatus: StatusMutator
}) {
    return (
        <Switch
            checked={checked}
            disabled={disabled}
            aria-label={ariaLabel}
            onCheckedChange={(value) =>
                setStatus(value === true ? "active" : "inactive", {
                    onSuccess: () => notifySuccess(successMessage),
                    onError: () => notifyError(errorMessage),
                })
            }
        />
    )
}
