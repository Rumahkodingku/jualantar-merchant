import { RequireOwner } from "~/modules/authorization"

import { ProductNewPage } from "../pages/product-new-page"

export default function ProductNewRoute() {
    return (
        <RequireOwner>
            <ProductNewPage />
        </RequireOwner>
    )
}
