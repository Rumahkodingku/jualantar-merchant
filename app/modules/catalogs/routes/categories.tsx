import { RequireOwner } from "~/modules/authorization"

import { CatalogCategoriesPage } from "../pages/categories-page"

export default function CatalogCategoriesRoute() {
    return (
        <RequireOwner>
            <CatalogCategoriesPage />
        </RequireOwner>
    )
}
