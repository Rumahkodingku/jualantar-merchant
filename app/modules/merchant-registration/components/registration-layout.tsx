import { useEffect, useRef } from "react"
import { Outlet } from "react-router"

import { ErrorState } from "~/components/error-state"
import { SplashScreen } from "~/components/splash-screen"
import { ApiError } from "~/lib/api"

import { RegistrationProvider } from "./registration-context"
import { RegistrationScreen } from "./registration-screen"
import { RegistrationStatusScreen } from "./registration-status-screen"
import { useCreateRegistration } from "../services/merchant-registration.mutations"
import { useRegistration } from "../services/merchant-registration.queries"

export function RegistrationLayout() {
    const { data, error, isError, isLoading, refetch } = useRegistration()
    const createDraft = useCreateRegistration()
    const createAttempted = useRef(false)

    const isNotFound = error instanceof ApiError && error.code === "merchant_registration_not_found"
    const isConflict = error instanceof ApiError && error.code === "merchant_registration_already_exists"

    useEffect(() => {
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
    }, [isNotFound, isConflict, createDraft, refetch])

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

    if (data.status !== "draft") {
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
