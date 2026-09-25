import { Link, useLocation } from "react-router"
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Text } from "~/components/ui/text"
import { CATALOGS_PATHS } from "../utils/paths"
import { Package, Tags, SlidersHorizontal } from "lucide-react"

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
        label: "Kategori",
        icon: Tags,
    },
    {
        to: CATALOGS_PATHS.modifiers,
        value: "modifier",
        label: "Modifier",
        icon: SlidersHorizontal,
    },
] as const

type CatalogTabValue = (typeof TABS)[number]["value"]

function getActiveTab(pathname: string): CatalogTabValue {
    if (pathname.startsWith(CATALOGS_PATHS.categories)) {
        return "kategori"
    }

    if (pathname.startsWith(CATALOGS_PATHS.modifiers)) {
        return "modifier"
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
export function CatalogLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-1 flex-col gap-5">
            <section className="mb-4 flex flex-col gap-1">
                <Text as="h1" variant="2xl" weight="semibold" className="tracking-tight">
                    Katalog
                </Text>
                <Text variant="sm" className="text-muted-foreground">
                    Kelola produk, kategori, dan kustomisasi katalog Anda.
                </Text>
            </section>

            <CatalogTabs />

            {children}
        </div>
    )
}
