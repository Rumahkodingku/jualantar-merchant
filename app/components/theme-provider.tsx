import { useEffect } from "react"

import { resolveThemeMode, useThemeStore } from "~/stores"

const THEME_COLOR_LIGHT = "#ffffff"
const THEME_COLOR_DARK = "#23262b"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const mode = useThemeStore((state) => state.mode)
    const setResolved = useThemeStore((state) => state.setResolved)

    useEffect(() => {
        if (typeof window === "undefined") {
            return
        }

        const media = window.matchMedia("(prefers-color-scheme: dark)")

        const apply = () => {
            const resolved = resolveThemeMode(mode, media.matches)
            setResolved(resolved)
            document.documentElement.classList.toggle("dark", resolved === "dark")
            document
                .querySelector('meta[name="theme-color"]')
                ?.setAttribute("content", resolved === "dark" ? THEME_COLOR_DARK : THEME_COLOR_LIGHT)
        }

        apply()
        media.addEventListener("change", apply)

        return () => media.removeEventListener("change", apply)
    }, [mode, setResolved])

    return <>{children}</>
}
