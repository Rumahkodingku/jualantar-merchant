import { RequireOwner } from "~/modules/authorization"

import { ProductEditPage } from "../pages/product-edit-page"

export default function ProductEditRoute() {
    return (
        <RequireOwner>
            <ProductEditPage />
        </RequireOwner>
    )
}
