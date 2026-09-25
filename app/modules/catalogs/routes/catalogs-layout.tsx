import { Outlet } from "react-router"

import { CatalogLayout } from "../components/catalog-layout"

export default function CatalogsLayoutRoute() {
    return (
        <CatalogLayout>
            <Outlet />
        </CatalogLayout>
    )
}
