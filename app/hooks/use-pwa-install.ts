import { useCallback, useEffect, useState } from "react"

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

function isStandaloneDisplay(): boolean {
    if (typeof window === "undefined") {
        return false
    }

    const displayStandalone = window.matchMedia?.("(display-mode: standalone)").matches ?? false
    const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true

    return displayStandalone || iosStandalone
}

function isIosSafari(): boolean {
    if (typeof navigator === "undefined") {
        return false
    }

    const userAgent = navigator.userAgent
    const isIos = /iphone|ipad|ipod/i.test(userAgent)
    const isSafari = /safari/i.test(userAgent) && !/crios|fxios|edgios/i.test(userAgent)

    return isIos && isSafari
}

export function usePwaInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [installed, setInstalled] = useState(false)
    const [isIos, setIsIos] = useState(false)

    useEffect(() => {
        setInstalled(isStandaloneDisplay())
        setIsIos(isIosSafari())

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault()
            setDeferredPrompt(event as BeforeInstallPromptEvent)
        }

        const handleInstalled = () => {
            setInstalled(true)
            setDeferredPrompt(null)
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
        window.addEventListener("appinstalled", handleInstalled)

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
            window.removeEventListener("appinstalled", handleInstalled)
        }
    }, [])

    const promptInstall = useCallback(async () => {
        if (!deferredPrompt) {
            return
        }

        await deferredPrompt.prompt()
        const choice = await deferredPrompt.userChoice

        if (choice.outcome === "accepted") {
            setInstalled(true)
        }

        setDeferredPrompt(null)
    }, [deferredPrompt])

    return {
        canInstall: deferredPrompt !== null,
        isIos,
        installed,
        promptInstall,
    }
}
