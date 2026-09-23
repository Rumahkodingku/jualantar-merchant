import { useEffect, useRef } from "react"
import { Navigate, Outlet } from "react-router"

import { ErrorState } from "~/components/error-state"
import { SplashScreen } from "~/components/splash-screen"
import { ApiError } from "~/lib/api"
import { useAuthorization } from "~/modules/authorization"

import { RegistrationProvider } from "./registration-context"
import { RegistrationScreen } from "./registration-screen"
import { RegistrationStatusScreen } from "./registration-status-screen"
import { useCreateRegistration } from "../services/merchant-registration.mutations"
import { useRegistration } from "../services/merchant-registration.queries"

export function RegistrationLayout() {
    const { user, isOwner, isLoading: isAuthLoading } = useAuthorization()
    // Alur /registration hanya untuk owner. Query dimatikan untuk non-owner
    // agar karyawan tidak menerima 404 lalu terpicu pembuatan draft otomatis.
    const { data, error, isError, isLoading, refetch } = useRegistration(isOwner)
    const createDraft = useCreateRegistration()
    const createAttempted = useRef(false)

    const isNotFound = error instanceof ApiError && error.code === "merchant_registration_not_found"
    const isConflict = error instanceof ApiError && error.code === "merchant_registration_already_exists"

    useEffect(() => {
        if (!isOwner) {
            return
        }

        if (isNotFound && !createAttempted.current) {
            createAttempted.current = true
            createDraft.mutate(undefined, {
                onSettled: () => {
                    void refetch()
                },
            })
        }

        if (isConflict) {
            void refetch()
        }
    }, [isOwner, isNotFound, isConflict, createDraft, refetch])

    if (isAuthLoading) {
        return <SplashScreen label="Memeriksa akses…" />
    }

    if (user === null) {
        return <Navigate to="/403" replace />
    }

    if (!isOwner) {
        // Karyawan tidak boleh masuk alur pendaftaran: yang punya assignment
        // kembali ke beranda outlet-nya, yang tanpa akses ke halaman 403.
        // Ini mencegah terciptanya merchant ganda via pembuatan draft otomatis.
        return <Navigate to={user.outletAssignments.length > 0 ? "/" : "/403"} replace />
    }

    if (isLoading || createDraft.isPending) {
        return <SplashScreen label="Menyiapkan pendaftaran…" />
    }

    if (isError && !isNotFound && !isConflict) {
        return (
            <div className="flex min-h-svh items-center justify-center">
                <ErrorState
                    title="Gagal memuat pendaftaran"
                    description={error instanceof ApiError ? error.detail : "Silakan coba beberapa saat lagi."}
                    onRetry={() => void refetch()}
                />
            </div>
        )
    }

    if (data === undefined) {
        return <SplashScreen label="Menyiapkan pendaftaran…" />
    }

    if (data.status !== "draft" && data.status !== "revision_required") {
        return <RegistrationStatusScreen registration={data} />
    }

    return (
        <RegistrationProvider registration={data}>
            <RegistrationScreen>
                <Outlet />
            </RegistrationScreen>
        </RegistrationProvider>
    )
}
