import { CheckIcon, MoonIcon, SunIcon, SunMoonIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Text } from "~/components/ui/text"
import { THEME_MODES, useThemeStore, type ThemeMode } from "~/stores"
import { cn } from "~/lib/utils"

const OPTIONS: { mode: ThemeMode; label: string; description: string; icon: LucideIcon }[] = [
    {
        mode: "light",
        label: "Terang",
        description: "Gunakan tampilan terang setiap saat.",
        icon: SunIcon,
    },
    {
        mode: "dark",
        label: "Gelap",
        description: "Gunakan tampilan gelap setiap saat.",
        icon: MoonIcon,
    },
    {
        mode: "system",
        label: "Ikuti sistem",
        description: "Ikuti tema perangkat secara otomatis.",
        icon: SunMoonIcon,
    },
]

export function ThemeSwitcher() {
    const mode = useThemeStore((state) => state.mode)
    const resolved = useThemeStore((state) => state.resolved)
    const setMode = useThemeStore((state) => state.setMode)

    return (
        <fieldset>
            <legend className="sr-only">Mode tampilan</legend>
            <div className="flex flex-col divide-y">
                {THEME_MODES.map((value) => {
                    const option = OPTIONS.find((item) => item.mode === value)
                    if (!option) {
                        return null
                    }

                    const Icon = option.icon
                    const checked = mode === value
                    const descriptionId = `theme-mode-description-${value}`

                    return (
                        <label
                            key={value}
                            className={cn(
                                "flex min-h-16 w-full cursor-pointer items-center gap-3 px-4 py-3 transition-colors outline-none focus-within:bg-muted/60 hover:bg-muted/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring/50 has-[:focus-visible]:ring-inset"
                            )}
                        >
                            <input
                                type="radio"
                                name="theme-mode"
                                value={value}
                                aria-label={option.label}
                                checked={checked}
                                onChange={() => setMode(value)}
                                className="sr-only"
                                aria-describedby={descriptionId}
                            />
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                                <Icon className="size-4" aria-hidden="true" />
                            </span>
                            <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-left">
                                <Text as="span" variant="sm" weight="medium" className="break-words">
                                    {option.label}
                                </Text>
                                <Text
                                    as="span"
                                    id={descriptionId}
                                    variant="xs"
                                    className="leading-relaxed break-words text-muted-foreground"
                                >
                                    {value === "system"
                                        ? `Ikuti tema perangkat. Saat ini menggunakan mode ${resolved === "dark" ? "gelap" : "terang"}.`
                                        : option.description}
                                </Text>
                            </span>
                            <span
                                aria-hidden="true"
                                className={cn(
                                    "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                                    checked
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-input text-transparent"
                                )}
                            >
                                <CheckIcon className="size-3.5" />
                            </span>
                        </label>
                    )
                })}
            </div>
        </fieldset>
    )
}
