import type { ReactNode } from "react"
import { Navigate } from "react-router"

import { ErrorState } from "~/components/error-state"
import { SplashScreen } from "~/components/splash-screen"
import { ApiError } from "~/lib/api"

import { useRegistration } from "../services/merchant-registration.queries"
import { REGISTRATION_BASE } from "../utils/steps"

export function MerchantApprovedGuard({ children }: { children: ReactNode }) {
    const { data, error, isError, isPending, refetch } = useRegistration()

    if (isPending) {
        return <SplashScreen label="Memeriksa status merchant…" />
    }

    if (data !== undefined) {
        if (data.status === "approved") {
            return <>{children}</>
        }

        return <Navigate to={REGISTRATION_BASE} replace />
    }

    if (isError) {
        const isNotFound = error instanceof ApiError && error.code === "merchant_registration_not_found"

        if (isNotFound) {
            return <Navigate to={REGISTRATION_BASE} replace />
        }

        return (
            <div className="flex min-h-svh items-center justify-center">
                <ErrorState
                    title="Gagal memeriksa status merchant"
                    description={error instanceof ApiError ? error.detail : "Silakan coba beberapa saat lagi."}
                    onRetry={() => void refetch()}
                />
            </div>
        )
    }

    return <SplashScreen label="Memeriksa status merchant…" />
}
