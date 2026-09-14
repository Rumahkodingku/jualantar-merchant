import { useEffect, useState, type ReactNode } from "react"
import { Navigate } from "react-router"

import { SplashScreen } from "~/components/splash-screen"

import { useSession } from "../hooks/use-session"

export function ProtectedRoute({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false)
    const { hasToken, isUnauthorized, isLoading } = useSession()

    useEffect(() => setMounted(true), [])

    if (!mounted || isLoading) {
        return <SplashScreen label="Menyiapkan akun…" />
    }

    if (!hasToken || isUnauthorized) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}
