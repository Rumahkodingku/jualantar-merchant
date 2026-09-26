import { ClockIcon, XIcon } from "lucide-react"

import { Alert, AlertAction, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export function relativeTime(iso: string | null): string | null {
    if (iso === null) {
        return null
    }

    const elapsed = Date.now() - new Date(iso).getTime()

    if (!Number.isFinite(elapsed) || elapsed < 0) {
        return null
    }

    if (elapsed < MINUTE) {
        return "baru saja"
    }

    if (elapsed < HOUR) {
        return `${Math.floor(elapsed / MINUTE)} menit lalu`
    }

    if (elapsed < DAY) {
        return `${Math.floor(elapsed / HOUR)} jam lalu`
    }

    return `${Math.floor(elapsed / DAY)} hari lalu`
}

/**
 * Shown when a merchant reopens the wizard with work already in progress. The
 * draft is restored automatically, so this only has to say so and offer a way
 * out.
 */
export function DraftResumeBanner({
    updatedAt,
    stepLabel,
    reconcileNotice,
    onDiscard,
    onDismiss,
}: {
    updatedAt: string | null
    stepLabel: string
    reconcileNotice: string | null
    onDiscard: () => void
    onDismiss: () => void
}) {
    const when = relativeTime(updatedAt)

    return (
        <Alert>
            <ClockIcon aria-hidden="true" />
            <AlertTitle>Draft dilanjutkan</AlertTitle>
            <AlertDescription>
                {when === null
                    ? "Isian yang belum disimpan sebagai produk sudah dikembalikan."
                    : `Isian tersimpan ${when}, Anda berhenti di langkah ${stepLabel}. Draft kedaluwarsa sendiri dalam 7 hari.`}
                {reconcileNotice === null ? null : (
                    <span className="mt-1 block font-medium text-destructive">{reconcileNotice}</span>
                )}
            </AlertDescription>
            <AlertAction className="flex items-center gap-1">
                <Button type="button" size="xs" variant="outline" onClick={onDiscard}>
                    Mulai dari awal
                </Button>
                <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    aria-label="Tutup pemberitahuan draft"
                    onClick={onDismiss}
                >
                    <XIcon />
                </Button>
            </AlertAction>
        </Alert>
    )
}
