import {
    BanknoteIcon,
    ClockIcon,
    NotebookPenIcon,
    SettingsIcon,
    ShoppingBagIcon,
    TagIcon,
    type LucideIcon,
} from "lucide-react"
import { Link } from "react-router"

import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"
import { outletHoursPath } from "~/modules/merchant-operations"
import { PRODUCTS_PATHS } from "~/modules/products"
import { PROMOTIONS_PATHS } from "~/modules/promotions"
import { SETTINGS_PATHS } from "~/modules/settings"

type MenuItem = {
    to: string
    label: string
    icon: LucideIcon
}

const PASTELS = [
    "bg-sky-500/10 text-sky-700 dark:text-sky-400",
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    "bg-violet-500/10 text-violet-700 dark:text-violet-400",
    "bg-rose-500/10 text-rose-700 dark:text-rose-400",
    "bg-slate-500/10 text-slate-700 dark:text-slate-300",
]

export function MainMenuGrid({ outletId }: { outletId: string | null }) {
    const items: MenuItem[] = [
        { to: "/orders", label: "Pesanan", icon: NotebookPenIcon },
        { to: PRODUCTS_PATHS.home, label: "Produk", icon: ShoppingBagIcon },
        { to: PROMOTIONS_PATHS.home, label: "Promo", icon: TagIcon },
        { to: "/finances", label: "Keuangan", icon: BanknoteIcon },
        {
            to: outletId === null ? SETTINGS_PATHS.outlets : outletHoursPath(outletId),
            label: "Jam Operasional",
            icon: ClockIcon,
        },
        { to: SETTINGS_PATHS.home, label: "Pengaturan", icon: SettingsIcon },
    ]

    return (
        <section aria-label="Menu utama" className="flex flex-col gap-2">
            <Text as="h2" variant="sm" weight="semibold">
                Menu Utama
            </Text>
            <div className="grid grid-cols-3 gap-3">
                {items.map((item, index) => (
                    <Link
                        key={item.label}
                        to={item.to}
                        className="flex flex-col items-center gap-2 rounded-2xl border bg-card px-2 py-4 text-center transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/60"
                    >
                        <span
                            className={cn(
                                "flex size-11 items-center justify-center rounded-2xl",
                                PASTELS[index % PASTELS.length]
                            )}
                        >
                            <item.icon className="size-5" aria-hidden="true" />
                        </span>
                        <Text as="span" variant="xs" weight="medium" className="leading-tight">
                            {item.label}
                        </Text>
                    </Link>
                ))}
            </div>
        </section>
    )
}
