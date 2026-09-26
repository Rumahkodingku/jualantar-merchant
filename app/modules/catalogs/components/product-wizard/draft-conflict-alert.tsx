import { TriangleAlertIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"

/**
 * The draft moved on in another tab or another device. The API has no
 * force-overwrite, so the merchant is asked which version to keep rather than
 * having their last keystrokes silently replaced.
 */
export function DraftConflictAlert({
    onReload,
    onOverwrite,
    isResolving,
}: {
    onReload: () => void
    onOverwrite: () => void
    isResolving: boolean
}) {
    return (
        <Alert variant="destructive">
            <TriangleAlertIcon aria-hidden="true" />
            <AlertTitle>Draft diubah di tempat lain</AlertTitle>
            <AlertDescription className="flex flex-col items-start gap-2">
                <span>
                    Draft ini berubah di tab atau perangkat lain sejak Anda membukanya. Pilih isi mana yang ingin
                    dipakai.
                </span>
                <div className="flex flex-wrap gap-2">
                    <Button type="button" size="xs" variant="outline" disabled={isResolving} onClick={onReload}>
                        Muat versi terbaru
                    </Button>
                    <Button type="button" size="xs" disabled={isResolving} onClick={onOverwrite}>
                        Simpan isi saya
                    </Button>
                </div>
            </AlertDescription>
        </Alert>
    )
}
