import { NavLink } from "react-router"
import { HomeIcon, SettingsIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "~/lib/utils"

export interface AppNavItem {
    to: string
    label: string
    icon: LucideIcon
    end: boolean
}

export const APP_NAV_ITEMS: AppNavItem[] = [
    { to: "/", label: "Beranda", icon: HomeIcon, end: true },
    { to: "/settings", label: "Pengaturan", icon: SettingsIcon, end: false },
]

export function BottomNav() {
    return (
        <nav
            aria-label="Navigasi utama"
            className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
        >
            <ul className="mx-auto flex w-full max-w-md items-stretch">
                {APP_NAV_ITEMS.map((item) => (
                    <li key={item.to} className="flex-1">
                        <NavLink
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                cn(
                                    "flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon
                                        className={cn("size-5", isActive && "stroke-[2.5]")}
                                        aria-hidden="true"
                                    />
                                    <span>{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
