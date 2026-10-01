import { useAuthorization } from "~/modules/authorization"

import { CatalogsPage } from "./catalogs-page"
import { OutletCatalogPage } from "./outlet-catalog-page"

/**
 * Chooses the catalog experience by role: the merchant owner gets the master
 * catalog (administration), everyone else gets the outlet catalog. Two distinct
 * pages instead of one page with scattered role conditionals.
 */
export function CatalogsHomePage() {
    const { isOwner, isLoading } = useAuthorization()

    if (isLoading) {
        return null
    }

    return isOwner ? <CatalogsPage /> : <OutletCatalogPage />
}
