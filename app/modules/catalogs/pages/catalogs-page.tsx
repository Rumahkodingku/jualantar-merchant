import { PlusIcon, ShoppingBagIcon } from "lucide-react"
import { Link } from "react-router"

import { Button } from "~/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "~/components/ui/empty"
import { Text } from "~/components/ui/text"

import { CATALOGS_PATHS } from "../utils/paths"

export function CatalogsPage() {
    return (
        <div className="flex flex-1 flex-col gap-5">
            <section className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                    <Text as="h1" variant="2xl" weight="semibold" className="tracking-tight">
                        Katalog
                    </Text>
                    <Text variant="sm" className="text-muted-foreground">
                        Kelola katalog yang dijual di outlet Anda.
                    </Text>
                </div>
                <Button render={<Link to={CATALOGS_PATHS.new} />} size="sm" className="shrink-0">
                    <PlusIcon aria-hidden="true" />
                    Tambah
                </Button>
            </section>

            <Empty className="border">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <ShoppingBagIcon aria-hidden="true" />
                    </EmptyMedia>
                    <EmptyTitle>Belum ada katalog</EmptyTitle>
                    <EmptyDescription>
                        Tambahkan produk pertama Anda agar pelanggan dapat mulai memesan.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button render={<Link to={CATALOGS_PATHS.new} />}>
                        <PlusIcon aria-hidden="true" />
                        Tambah produk
                    </Button>
                </EmptyContent>
            </Empty>
        </div>
    )
}
