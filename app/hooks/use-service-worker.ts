import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "~/components/ui/toast"

export function useServiceWorker() {
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const registrationRef = useRef<ServiceWorkerRegistration | null>(null)
    const refreshingRef = useRef(false)
    const notifiedRef = useRef(false)

    const applyUpdate = useCallback(() => {
        const registration = registrationRef.current

        if (!registration?.waiting) {
            window.location.reload()
            return
        }

        refreshingRef.current = true
        registration.waiting.postMessage({ type: "SKIP_WAITING" })
    }, [])

    useEffect(() => {
        if (!import.meta.env.PROD) {
            return
        }

        if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
            return
        }

        let cancelled = false

        const notifyUpdate = (registration: ServiceWorkerRegistration) => {
            setUpdateAvailable(true)

            if (notifiedRef.current) {
                return
            }
            notifiedRef.current = true

            toast.add({
                title: "Versi baru tersedia",
                description: "Muat ulang untuk menggunakan versi terbaru JualAntar Merchant.",
                type: "info",
                timeout: 0,
                actionProps: {
                    children: "Muat ulang",
                    onClick: applyUpdate,
                },
            })
        }

        navigator.serviceWorker
            .register("/sw.js", { scope: "/", updateViaCache: "none" })
            .then((registration) => {
                if (cancelled) {
                    return
                }

                registrationRef.current = registration

                if (registration.waiting) {
                    notifyUpdate(registration)
                }

                registration.addEventListener("updatefound", () => {
                    const installing = registration.installing
                    if (!installing) {
                        return
                    }

                    installing.addEventListener("statechange", () => {
                        if (installing.state === "installed" && navigator.serviceWorker.controller) {
                            notifyUpdate(registration)
                        }
                    })
                })
            })
            .catch((error: unknown) => {
                console.error("Service worker registration failed", error)
            })

        const handleControllerChange = () => {
            if (!refreshingRef.current) {
                return
            }

            refreshingRef.current = false
            window.location.reload()
        }

        const handleFocus = () => {
            registrationRef.current?.update().catch(() => {
                // Update checks are best-effort.
            })
        }

        navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange)
        window.addEventListener("focus", handleFocus)

        return () => {
            cancelled = true
            navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange)
            window.removeEventListener("focus", handleFocus)
        }
    }, [applyUpdate])

    return { updateAvailable, applyUpdate }
}
