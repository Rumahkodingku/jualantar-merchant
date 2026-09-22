import { NavLink, useNavigate } from "react-router"
import { Banknote, HomeIcon, NotebookPen, Plus, SettingsIcon, Store, Tag, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "~/lib/utils"
import { Text } from "~/components/ui/text"
import { useState } from "react"

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
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const handleAction = (to: string) => {
        setIsOpen(false)
        navigate(to)
    }

    return (
        <nav
            aria-label="Navigasi utama"
            className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
        >
            <div className="relative mx-auto w-full max-w-md md:max-w-2xl lg:max-w-3xl">
                {/* Quick Actions */}
                <div
                    className={cn(
                        "absolute inset-x-0 bottom-full flex justify-center px-4 pb-3",
                        "pointer-events-none translate-y-2 opacity-0 transition-all duration-200",
                        isOpen && "pointer-events-auto translate-y-0 opacity-100"
                    )}
                >
                    <div className="mb-4 w-full max-w-xs overflow-hidden rounded-2xl border bg-background shadow-xl">
                        <button
                            type="button"
                            onClick={() => handleAction("/products/new")}
                            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted"
                        >
                            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Plus className="size-5" />
                            </span>

                            <span>
                                <Text variant="sm" weight="semibold">
                                    Tambah Produk
                                </Text>
                                <Text variant="xs" className="text-muted-foreground">
                                    Tambahkan produk baru
                                </Text>
                            </span>
                        </button>

                        <div className="border-t" />

                        <button
                            type="button"
                            onClick={() => handleAction("/promotions/new")}
                            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted"
                        >
                            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Tag className="size-5" />
                            </span>

                            <span>
                                <Text variant="sm" weight="semibold">
                                    Tambah Promo
                                </Text>
                                <Text variant="xs" className="text-muted-foreground">
                                    Buat promo untuk pelanggan
                                </Text>
                            </span>
                        </button>

                        <div className="border-t" />

                        <button
                            type="button"
                            onClick={() => handleAction("/settings/outlets")}
                            className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted"
                        >
                            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Store className="size-5" />
                            </span>

                            <span>
                                <Text variant="sm" weight="semibold">
                                    Tambah Outlet
                                </Text>
                                <Text variant="xs" className="text-muted-foreground">
                                    Tambahkan outlet baru
                                </Text>
                            </span>
                        </button>
                    </div>
                </div>

                {/* Bottom Navigation */}
                <ul className="flex w-full items-stretch">
                    {/* Left Navigation */}
                    <div className="flex flex-1">
                        {APP_NAV_ITEMS.slice(0, 2).map((item) => (
                            <NavItem key={item.to} item={item} />
                        ))}
                    </div>

                    {/* Center Action */}
                    <li className="relative flex w-20 shrink-0 justify-center">
                        <button
                            type="button"
                            onClick={() => setIsOpen((value) => !value)}
                            aria-label={isOpen ? "Tutup menu aksi" : "Buka menu aksi"}
                            aria-expanded={isOpen}
                            className={cn(
                                "absolute -top-6 flex size-18 items-center justify-center",
                                "rounded-full border-4 border-background",
                                "bg-primary text-primary-foreground",
                                "shadow-lg shadow-primary/25",
                                "transition-all duration-200",
                                "hover:scale-105 active:scale-95",
                                isOpen && "rotate-0"
                            )}
                        >
                            {isOpen ? (
                                <X className="size-7" strokeWidth={2.5} />
                            ) : (
                                <Plus className="size-7" strokeWidth={2.5} />
                            )}
                        </button>
                    </li>

                    {/* Right Navigation */}
                    <div className="flex flex-1">
                        {APP_NAV_ITEMS.slice(2).map((item) => (
                            <NavItem key={item.to} item={item} />
                        ))}
                    </div>
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
