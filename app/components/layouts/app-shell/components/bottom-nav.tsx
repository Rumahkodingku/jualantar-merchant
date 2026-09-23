import { NavLink, useNavigate } from "react-router"
import { Banknote, HomeIcon, NotebookPen, Plus, SettingsIcon, Store, Tag, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "~/lib/utils"
import { Text } from "~/components/ui/text"
import { useState } from "react"
import { CAP, useAuthorization, type OperationsCapability } from "~/modules/authorization"

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

interface QuickAction {
    to: string
    label: string
    description: string
    icon: LucideIcon
    /** When set, the action is hidden unless the user holds this capability. */
    capability?: OperationsCapability
}

/**
 * "Tambah Outlet" is an owner-only (global) capability. "Tambah Produk" and
 * "Tambah Promo" belong to the products/promotions modules, which are outside
 * this plan's scope and have no authorization contract yet — they stay visible
 * rather than inventing a rule.
 */
const QUICK_ACTIONS: QuickAction[] = [
    {
        to: "/products/new",
        label: "Tambah Produk",
        description: "Tambahkan produk baru",
        icon: Plus,
    },
    {
        to: "/promotions/new",
        label: "Tambah Promo",
        description: "Buat promo untuk pelanggan",
        icon: Tag,
    },
    {
        to: "/settings/outlets/new",
        label: "Tambah Outlet",
        description: "Tambahkan outlet baru",
        icon: Store,
        capability: CAP.outletsCreate,
    },
]

export function BottomNav() {
    const navigate = useNavigate()
    const { can } = useAuthorization()
    const [isOpen, setIsOpen] = useState<boolean>(false)

    const actions = QUICK_ACTIONS.filter((action) => action.capability === undefined || can(action.capability))

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
                        {actions.map((action, index) => (
                            <div key={action.to}>
                                {index > 0 ? <div className="border-t" /> : null}

                                <button
                                    type="button"
                                    onClick={() => handleAction(action.to)}
                                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted"
                                >
                                    <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <action.icon className="size-5" />
                                    </span>

                                    <span>
                                        <Text variant="sm" weight="semibold">
                                            {action.label}
                                        </Text>
                                        <Text variant="xs" className="text-muted-foreground">
                                            {action.description}
                                        </Text>
                                    </span>
                                </button>
                            </div>
                        ))}
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
                                "absolute -top-8 flex size-18 items-center justify-center",
                                "rounded-full border-4 border-background",
                                "bg-primary text-primary-foreground",
                                "shadow-sm shadow-primary/25",
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
