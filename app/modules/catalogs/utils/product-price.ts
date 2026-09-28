import { formatCurrency } from "./format-currency"
import type { ProductDetailPriceSummary } from "../types/catalog.types"

export function formatSummaryPrice(price: ProductDetailPriceSummary): string {
    if (price.value === null) {
        return "Harga belum tersedia"
    }

    return price.type === "from" ? `Mulai dari ${formatCurrency(price.value)}` : formatCurrency(price.value)
}
