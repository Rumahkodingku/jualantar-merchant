import { Banknote, HomeIcon, NotebookPen, Package, SettingsIcon } from "lucide-react"

import type { AppNavItem } from "~/components/layouts/app-shell/components/bottom-nav"

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
