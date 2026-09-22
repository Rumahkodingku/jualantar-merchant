import { beforeEach, describe, expect, it } from "vitest"

import { THEME_STORAGE_KEY, resolveThemeMode, useThemeStore } from "./theme-store"

beforeEach(() => {
    window.localStorage.clear()
    useThemeStore.setState({ mode: "system", resolved: "light" })
})

describe("resolveThemeMode", () => {
    it("returns light/dark directly when mode is explicit", () => {
        expect(resolveThemeMode("light", true)).toBe("light")
        expect(resolveThemeMode("light", false)).toBe("light")
        expect(resolveThemeMode("dark", true)).toBe("dark")
        expect(resolveThemeMode("dark", false)).toBe("dark")
    })

    it("follows the system preference when mode is system", () => {
        expect(resolveThemeMode("system", true)).toBe("dark")
        expect(resolveThemeMode("system", false)).toBe("light")
    })
})

describe("useThemeStore", () => {
    it("defaults to system mode", () => {
        expect(useThemeStore.getState().mode).toBe("system")
    })

    it("updates mode and persists only the mode field", () => {
        useThemeStore.getState().setMode("dark")

        expect(useThemeStore.getState().mode).toBe("dark")

        const raw = window.localStorage.getItem(THEME_STORAGE_KEY)
        expect(raw).not.toBeNull()
        expect(JSON.parse(raw ?? "")).toEqual({ state: { mode: "dark" }, version: 1 })
    })

    it("keeps resolved theme transient (not persisted)", () => {
        useThemeStore.getState().setResolved("dark")

        expect(useThemeStore.getState().resolved).toBe("dark")

        const raw = window.localStorage.getItem(THEME_STORAGE_KEY)
        expect(raw === null || !raw.includes("resolved")).toBe(true)
    })
})
