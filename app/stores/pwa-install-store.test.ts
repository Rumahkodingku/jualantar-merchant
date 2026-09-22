import { beforeEach, describe, expect, it } from "vitest"

import { PWA_INSTALL_STORAGE_KEY, usePwaInstallStore, type BeforeInstallPromptEvent } from "./pwa-install-store"

function fakePromptEvent(): BeforeInstallPromptEvent {
    return {
        prompt: async () => {},
        userChoice: Promise.resolve({ outcome: "accepted", platform: "test" }),
    } as BeforeInstallPromptEvent
}

beforeEach(() => {
    window.localStorage.clear()
    usePwaInstallStore.setState({
        dismissed: false,
        canInstall: false,
        installed: false,
        isIos: false,
        deferredPrompt: null,
    })
})

describe("usePwaInstallStore", () => {
    it("starts not dismissed and not installed", () => {
        const state = usePwaInstallStore.getState()

        expect(state.dismissed).toBe(false)
        expect(state.installed).toBe(false)
        expect(state.canInstall).toBe(false)
    })

    it("persists dismissal across reloads", () => {
        usePwaInstallStore.getState().dismiss()

        expect(usePwaInstallStore.getState().dismissed).toBe(true)

        const raw = window.localStorage.getItem(PWA_INSTALL_STORAGE_KEY)
        expect(raw).not.toBeNull()
        expect(JSON.parse(raw ?? "")).toEqual({ state: { dismissed: true }, version: 1 })
    })

    it("tracks the install prompt event transiently", () => {
        usePwaInstallStore.getState().setPromptEvent(fakePromptEvent())

        const state = usePwaInstallStore.getState()
        expect(state.canInstall).toBe(true)
        expect(state.deferredPrompt).not.toBeNull()

        const raw = window.localStorage.getItem(PWA_INSTALL_STORAGE_KEY) ?? ""
        expect(raw.includes("deferredPrompt")).toBe(false)
    })

    it("marks installed and clears the prompt", () => {
        usePwaInstallStore.getState().setPromptEvent(fakePromptEvent())
        usePwaInstallStore.getState().markInstalled()

        const state = usePwaInstallStore.getState()
        expect(state.installed).toBe(true)
        expect(state.canInstall).toBe(false)
        expect(state.deferredPrompt).toBeNull()
    })
})
