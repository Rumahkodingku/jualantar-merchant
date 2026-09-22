import { create } from "zustand"
import { persist } from "zustand/middleware"

export const PWA_INSTALL_STORAGE_KEY = "jualantar-merchant.pwa-install"

export interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

interface PwaInstallState {
    dismissed: boolean
    canInstall: boolean
    installed: boolean
    isIos: boolean
    deferredPrompt: BeforeInstallPromptEvent | null
    setPromptEvent: (event: BeforeInstallPromptEvent) => void
    clearPrompt: () => void
    markInstalled: () => void
    setIsIos: (isIos: boolean) => void
    dismiss: () => void
}

export const usePwaInstallStore = create<PwaInstallState>()(
    persist(
        (set) => ({
            dismissed: false,
            canInstall: false,
            installed: false,
            isIos: false,
            deferredPrompt: null,
            setPromptEvent: (event) => set({ deferredPrompt: event, canInstall: true }),
            clearPrompt: () => set({ deferredPrompt: null, canInstall: false }),
            markInstalled: () => set({ installed: true, deferredPrompt: null, canInstall: false }),
            setIsIos: (isIos) => set({ isIos }),
            dismiss: () => set({ dismissed: true }),
        }),
        {
            name: PWA_INSTALL_STORAGE_KEY,
            version: 1,
            partialize: (state) => ({ dismissed: state.dismissed }),
        }
    )
)
