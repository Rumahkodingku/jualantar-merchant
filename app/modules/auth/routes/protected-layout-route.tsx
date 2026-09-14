import { Outlet } from "react-router"

import { ProtectedRoute } from "../components/protected-route"

export default function ProtectedLayoutRoute() {
    return (
        <ProtectedRoute>
            <Outlet />
        </ProtectedRoute>
    )
}
