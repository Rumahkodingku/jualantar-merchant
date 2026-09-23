import { Outlet } from "react-router"

import { MerchantApprovedGuard } from "../components/merchant-approved-guard"

export default function ApprovedGuardRoute() {
    return (
        <MerchantApprovedGuard>
            <Outlet />
        </MerchantApprovedGuard>
    )
}
