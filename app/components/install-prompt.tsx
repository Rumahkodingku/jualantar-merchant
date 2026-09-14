import { useEffect, useState } from "react"
import { DownloadIcon, ShareIcon, XIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import { usePwaInstall } from "~/hooks/use-pwa-install"

const DISMISS_KEY = "jualantar-merchant.pwa.install-dismissed"

export function InstallPrompt() {
    const { canInstall, isIos, installed, promptInstall } = usePwaInstall()
    const [dismissed, setDismissed] = useState(true)

    useEffect(() => {
        try {
            setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1")
        } catch {
            setDismissed(false)
        }
    }, [])

    if (installed || dismissed) {
        return null
    }

    if (!canInstall && !isIos) {
        return null
    }

    const dismiss = () => {
        setDismissed(true)

        try {
            window.localStorage.setItem(DISMISS_KEY, "1")
        } catch {
            // Storage may be unavailable; dismissal stays in-memory only.
        }
    }

    return (
        <div
            role="dialog"
            aria-label="Pasang JualAntar Merchant"
            className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-sm items-start gap-3 rounded-2xl border bg-popover p-4 text-popover-foreground shadow-lg"
        >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <DownloadIcon className="size-5" aria-hidden="true" />
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Text as="p" variant="sm" weight="semibold">
                    Pasang JualAntar Merchant
                </Text>

                {canInstall ? (
                    <Text variant="xs" className="text-muted-foreground">
                        Tambahkan aplikasi ke layar utama untuk akses lebih cepat.
                    </Text>
                ) : (
                    <Text variant="xs" className="flex items-center gap-1.5 text-muted-foreground">
                        <ShareIcon className="size-3.5 shrink-0" aria-hidden="true" />
                        Ketuk Bagikan, lalu pilih &quot;Tambah ke Layar Utama&quot;.
                    </Text>
                )}

                {canInstall && (
                    <Button type="button" size="sm" className="mt-1 self-start" onClick={promptInstall}>
                        Pasang sekarang
                    </Button>
                )}
            </div>

            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Tutup"
                className="-mt-1 -mr-1 shrink-0"
                onClick={dismiss}
            >
                <XIcon aria-hidden="true" />
            </Button>
        </div>
    )
}
