import { PlusIcon, TagIcon } from "lucide-react"
import { Link } from "react-router"

import { Button } from "~/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "~/components/ui/empty"
import { Text } from "~/components/ui/text"

import { PROMOTIONS_PATHS } from "../utils/paths"

export function PromotionsPage() {
    return (
        <div className="flex flex-1 flex-col gap-5">
            <section className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                    <Text as="h1" variant="2xl" weight="semibold" className="tracking-tight">
                        Promo
                    </Text>
                    <Text variant="sm" className="text-muted-foreground">
                        Buat promo untuk menarik pelanggan.
                    </Text>
                </div>
                <Button render={<Link to={PROMOTIONS_PATHS.new} />} size="sm" className="shrink-0">
                    <PlusIcon aria-hidden="true" />
                    Tambah
                </Button>
            </section>

            <Empty className="border">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <TagIcon aria-hidden="true" />
                    </EmptyMedia>
                    <EmptyTitle>Belum ada promo</EmptyTitle>
                    <EmptyDescription>Buat promo pertama Anda untuk meningkatkan penjualan.</EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <Button render={<Link to={PROMOTIONS_PATHS.new} />}>
                        <PlusIcon aria-hidden="true" />
                        Tambah promo
                    </Button>
                </EmptyContent>
            </Empty>
        </div>
    )
}
