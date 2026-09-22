import { useCallback, useEffect } from "react"

import { usePwaInstallStore, type BeforeInstallPromptEvent } from "~/stores"

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
    const canInstall = usePwaInstallStore((state) => state.canInstall)
    const installed = usePwaInstallStore((state) => state.installed)
    const isIos = usePwaInstallStore((state) => state.isIos)
    const deferredPrompt = usePwaInstallStore((state) => state.deferredPrompt)

    useEffect(() => {
        const { markInstalled, setIsIos, setPromptEvent, clearPrompt } = usePwaInstallStore.getState()

        if (isStandaloneDisplay()) {
            markInstalled()
        }

        setIsIos(isIosSafari())

        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault()
            setPromptEvent(event as BeforeInstallPromptEvent)
        }

        const handleInstalled = () => {
            markInstalled()
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
        window.addEventListener("appinstalled", handleInstalled)

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
            window.removeEventListener("appinstalled", handleInstalled)
            clearPrompt()
        }
    }, [])

    const promptInstall = useCallback(async () => {
        const { deferredPrompt: prompt, markInstalled, clearPrompt } = usePwaInstallStore.getState()

        if (!prompt) {
            return
        }

        await prompt.prompt()
        const choice = await prompt.userChoice

        if (choice.outcome === "accepted") {
            markInstalled()
        } else {
            clearPrompt()
        }
    }, [])

    return {
        canInstall,
        isIos,
        installed,
        promptInstall,
        deferredPrompt,
    }
}
