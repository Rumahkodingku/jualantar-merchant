import { InfoIcon } from "lucide-react"

import { DetailRows } from "./detail-rows"
import { formatDateTime } from "../../utils/format-datetime"
import { PRODUCT_TYPE_LABEL, STATUS_LABEL } from "../../utils/labels"
import { formatSummaryPrice } from "../../utils/product-price"
import type { ProductDetail } from "../../types/catalog.types"

export function ProductInfoDetails({ product }: { product: ProductDetail }) {
    const summary = product.summary

    return (
        <div className="mt-4">
            <DetailRows
                title="Informasi Produk"
                description="Lihat informasi produk ini dengan detail"
                icon={InfoIcon}
                rows={[
                    { term: "Kategori", value: product.category?.name ?? "Tanpa kategori" },
                    { term: "Tipe produk", value: PRODUCT_TYPE_LABEL[product.product_type] },
                    { term: "Status", value: STATUS_LABEL[product.status] },
                    { term: "Harga", value: formatSummaryPrice(summary.price) },
                    { term: "Jumlah variant", value: `${summary.variants_count} variant` },
                    { term: "Jumlah customization", value: `${summary.customization_groups_count} group` },
                    { term: "Jumlah media", value: `${summary.media_count} foto` },
                    { term: "Jumlah outlet", value: `${summary.outlets_count} outlet` },
                    { term: "Dibuat", value: formatDateTime(product.created_at) },
                    { term: "Diperbarui", value: formatDateTime(product.updated_at) },
                ]}
            />
        </div>
    )
}
