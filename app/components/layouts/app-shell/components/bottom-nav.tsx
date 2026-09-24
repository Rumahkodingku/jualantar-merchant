import { NavLink } from "react-router"
import { Banknote, HomeIcon, NotebookPen, Package, SettingsIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "~/lib/utils"
import { Text } from "~/components/ui/text"

export interface AppNavItem {
    to: string
    label: string
    icon: LucideIcon
    end: boolean
}

export const APP_NAV_ITEMS: AppNavItem[] = [
    {
        to: "/",
        label: "Beranda",
        icon: HomeIcon,
        end: true,
    },
    {
        to: "/catalogs",
        label: "Katalog",
        icon: Package,
        end: false,
    },
    {
        to: "/orders",
        label: "Pesanan",
        icon: NotebookPen,
        end: false,
    },
    {
        to: "/finances",
        label: "Keuangan",
        icon: Banknote,
        end: false,
    },
    {
        to: "/settings",
        label: "Pengaturan",
        icon: SettingsIcon,
        end: false,
    },
]

export function BottomNav() {
    return (
        <nav
            aria-label="Navigasi utama"
            className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
        >
            <div className="relative mx-auto w-full max-w-md md:max-w-2xl lg:max-w-3xl">
                <ul className="flex w-full items-stretch">
                    {APP_NAV_ITEMS.map((item) => (
                        <NavItem key={item.to} item={item} />
                    ))}
                </ul>
            </div>
        </nav>
    )
}

function NavItem({ item }: { item: AppNavItem }) {
    return (
        <li className="flex min-w-0 flex-1">
            <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                    cn(
                        "relative flex w-full flex-col items-center gap-1 py-3.5",
                        "transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )
                }
            >
                {({ isActive }) => (
                    <>
                        <item.icon
                            className={cn("size-5 transition-all", isActive && "stroke-[2.5]")}
                            aria-hidden="true"
                        />

                        <Text variant="xs" weight="semibold">
                            {item.label}
                        </Text>
                    </>
                )}
            </NavLink>
        </li>
    )
}
