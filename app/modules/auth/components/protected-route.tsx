import { useEffect, useState } from "react"
import { Navigate, Outlet } from "react-router"

import { FullScreenLoader } from "~/components/full-screen-loader"

import { useSession } from "../hooks/use-session"

export function ProtectedRoute() {
    const [mounted, setMounted] = useState(false)
    const { hasToken, isUnauthorized, isLoading } = useSession()

    useEffect(() => setMounted(true), [])

    if (!mounted || isLoading) {
        return <FullScreenLoader label="Menyiapkan akun…" />
    }

    if (!hasToken || isUnauthorized) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}
