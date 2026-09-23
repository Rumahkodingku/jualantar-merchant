import type { ReactNode } from "react"
import { Navigate } from "react-router"

import { ErrorState } from "~/components/error-state"
import { SplashScreen } from "~/components/splash-screen"
import { ApiError } from "~/lib/api"
import { useAuthorization } from "~/modules/authorization"

import { useRegistration } from "../services/merchant-registration.queries"
import { REGISTRATION_BASE } from "../utils/steps"

export function MerchantApprovedGuard({ children }: { children: ReactNode }) {
    const { user, isOwner, isLoading: isAuthLoading } = useAuthorization()
    // Registrasi merchant hanya milik owner. Karyawan outlet tidak pernah punya
    // baris registrasi (`merchant_registration_not_found`) sehingga query
    // dimatikan untuk mereka agar tidak memicu redirect yang salah.
    const { data, error, isError, isPending, refetch } = useRegistration(isOwner)

    if (isAuthLoading) {
        return <SplashScreen label="Memeriksa akses…" />
    }

    if (user === null) {
        return <Navigate to="/403" replace />
    }

    if (!isOwner) {
        // Karyawan dengan assignment lolos tanpa cek registrasi; API tetap
        // menjadi boundary otorisasi per-outlet. Tanpa assignment → 403 agar
        // tidak pernah diarahkan ke /registration (mencegah merchant ganda).
        if (user.outletAssignments.length > 0) {
            return <>{children}</>
        }

        return <Navigate to="/403" replace />
    }

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
