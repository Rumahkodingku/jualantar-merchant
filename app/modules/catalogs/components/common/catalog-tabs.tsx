import { Package, Tags } from "lucide-react"
import { Link, useLocation } from "react-router"

import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Text } from "~/components/ui/text"

import { CATALOGS_PATHS } from "../../utils/paths"

const TABS = [
    {
        to: CATALOGS_PATHS.home,
        value: "produk",
        label: "Produk",
        icon: Package,
    },
    {
        to: CATALOGS_PATHS.categories,
        value: "kategori",
        label: "Kategori Produk",
        icon: Tags,
    },
] as const

type CatalogTabValue = (typeof TABS)[number]["value"]

function getActiveTab(pathname: string): CatalogTabValue {
    if (pathname.startsWith(CATALOGS_PATHS.categories)) {
        return "kategori"
    }

    return "produk"
}

export function CatalogTabs() {
    const { pathname } = useLocation()

    return (
        <nav aria-label="Navigasi katalog">
            <Tabs value={getActiveTab(pathname)}>
                <TabsList variant="line" className="h-11 w-full pb-4">
                    {TABS.map((tab) => {
                        const Icon = tab.icon

                        return (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                nativeButton={false}
                                render={<Link to={tab.to} />}
                                className="gap-2 py-4 text-muted-foreground transition-colors hover:text-primary data-active:font-medium data-active:text-primary! data-active:after:bg-primary!"
                            >
                                <Icon className="size-4 shrink-0" />
                                <Text variant="xs" weight="semibold">
                                    {tab.label}
                                </Text>
                            </TabsTrigger>
                        )
                    })}
                </TabsList>
            </Tabs>
        </nav>
    )
}
