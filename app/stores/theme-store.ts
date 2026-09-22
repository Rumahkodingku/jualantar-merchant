import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ThemeMode = "light" | "dark" | "system"

export type ResolvedTheme = "light" | "dark"

export const THEME_STORAGE_KEY = "jualantar-merchant.theme"

export const THEME_MODES: ThemeMode[] = ["light", "dark", "system"]

interface ThemeState {
    mode: ThemeMode
    resolved: ResolvedTheme
    setMode: (mode: ThemeMode) => void
    setResolved: (resolved: ResolvedTheme) => void
}

export function resolveThemeMode(mode: ThemeMode, systemPrefersDark: boolean): ResolvedTheme {
    if (mode === "light") {
        return "light"
    }

    if (mode === "dark") {
        return "dark"
    }

    return systemPrefersDark ? "dark" : "light"
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            mode: "system",
            resolved: "light",
            setMode: (mode) => set({ mode }),
            setResolved: (resolved) => set({ resolved }),
        }),
        {
            name: THEME_STORAGE_KEY,
            version: 1,
            partialize: (state) => ({ mode: state.mode }),
        }
    )
)
