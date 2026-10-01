import { RequireOwner } from "~/modules/authorization"

import { ProductDetailPage } from "../pages/product-detail-page"

export default function ProductDetailRoute() {
    return (
        <RequireOwner>
            <ProductDetailPage />
        </RequireOwner>
    )
}
