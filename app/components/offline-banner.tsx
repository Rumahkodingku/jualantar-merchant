import { useEffect, useState } from "react"
import { WifiOffIcon } from "lucide-react"
import { Text } from "~/components/ui/text"

export function OfflineBanner() {
    const [offline, setOffline] = useState(false)

    useEffect(() => {
        if (typeof navigator === "undefined") {
            return
        }

        const update = () => setOffline(!navigator.onLine)

        update()
        window.addEventListener("online", update)
        window.addEventListener("offline", update)

        return () => {
            window.removeEventListener("online", update)
            window.removeEventListener("offline", update)
        }
    }, [])

    if (!offline) {
        return null
    }

    return (
        <div
            role="status"
            className="fixed inset-x-0 top-0 z-40 flex items-center justify-center gap-2 bg-primary px-4 py-2 text-primary-foreground"
        >
            <WifiOffIcon className="size-4" aria-hidden="true" />
            <Text as="span" variant="sm" weight="medium">
                Anda sedang offline
            </Text>
        </div>
    )
}
