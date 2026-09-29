import { useEffect } from "react"
import { useBlocker } from "react-router"

import { ConfirmDialog } from "../components/common/confirm-dialog"

/**
 * Keeps the merchant from losing an edit by accident.
 *
 * The edit wizard has no server draft, so an unsaved form exists in exactly one
 * place: the tab. Two exits need guarding and neither can be handled the same
 * way — the browser owns the tab close and only honours the native prompt, while
 * a link inside the app is ours to intercept and can be answered properly. The
 * flag is also dropped the moment a save starts, so a redirect away from a
 * successful save is not treated as an abandonment.
 */
export function useLeaveGuard({ isDirty, onDiscard }: { isDirty: boolean; onDiscard: () => void }) {
    const blocker = useBlocker(isDirty)

    useEffect(() => {
        if (!isDirty) {
            return
        }

        function warnOnClose(event: BeforeUnloadEvent) {
            event.preventDefault()
        }

        window.addEventListener("beforeunload", warnOnClose)

        return () => window.removeEventListener("beforeunload", warnOnClose)
    }, [isDirty])

    return (
        <ConfirmDialog
            open={blocker.state === "blocked"}
            onOpenChange={(open) => {
                if (!open && blocker.state === "blocked") {
                    blocker.reset()
                }
            }}
            title="Tinggalkan tanpa menyimpan?"
            description="Perubahan yang belum disimpan akan hilang. Tindakan ini tidak bisa dibatalkan."
            confirmLabel="Tinggalkan"
            variant="destructive"
            onConfirm={() => {
                onDiscard()
                blocker.proceed?.()
            }}
        />
    )
}
