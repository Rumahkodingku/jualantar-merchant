import { ChevronRightIcon } from "lucide-react"
import { Link } from "react-router"

import { Card, CardContent } from "~/components/ui/card"
import { Text } from "~/components/ui/text"
import { PRODUCTS_PATHS } from "~/modules/products"
import type { TopProduct } from "../types/home.types"
import { formatIDR } from "../utils/home-format"

export function TopProducts({ products }: { products: TopProduct[] }) {
    return (
        <section aria-label="Produk terlaris hari ini" className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
                <Text as="h2" variant="sm" weight="semibold">
                    Produk Terlaris Hari Ini
                </Text>
                <Link
                    to={PRODUCTS_PATHS.home}
                    className="inline-flex min-h-11 items-center gap-0.5 rounded-lg px-2 text-sm font-medium text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                    Lihat semua
                    <ChevronRightIcon className="size-4" aria-hidden="true" />
                </Link>
            </div>

            <Card>
                <CardContent className="flex flex-col gap-1">
                    {products.map((product, index) => (
                        <Link
                            key={product.id}
                            to={PRODUCTS_PATHS.home}
                            className="flex items-center gap-3 rounded-xl py-2.5 transition-colors outline-none hover:bg-muted/40 focus-visible:bg-muted/60"
                        >
                            <span
                                aria-hidden="true"
                                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-semibold text-muted-foreground"
                            >
                                {index + 1}
                            </span>
                            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                <Text as="span" variant="sm" weight="medium" truncate>
                                    {product.name}
                                </Text>
                                <Text as="span" variant="xs" className="truncate text-muted-foreground">
                                    {product.sold} terjual • {formatIDR(product.price)}
                                </Text>
                            </span>
                        </Link>
                    ))}
                </CardContent>
            </Card>
        </section>
    )
}
