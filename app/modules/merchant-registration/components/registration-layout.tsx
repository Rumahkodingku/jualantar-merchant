import { useEffect, useRef } from "react"
import { Outlet } from "react-router"

import { ErrorState } from "~/components/error-state"
import { FullScreenLoader } from "~/components/full-screen-loader"
import { ApiError } from "~/lib/api"

import { RegistrationProvider } from "./registration-context"
import { RegistrationShell } from "./registration-shell"
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
        return <FullScreenLoader label="Menyiapkan pendaftaran…" />
    }

    if (isError && !isNotFound && !isConflict) {
        return (
            <div className="flex min-h-[100dvh] items-center justify-center">
                <ErrorState
                    title="Gagal memuat pendaftaran"
                    description={error instanceof ApiError ? error.detail : "Silakan coba beberapa saat lagi."}
                    onRetry={() => void refetch()}
                />
            </div>
        )
    }

    if (data === undefined) {
        return <FullScreenLoader label="Menyiapkan pendaftaran…" />
    }

    if (data.status !== "draft") {
        return <RegistrationStatusScreen registration={data} />
    }

    return (
        <RegistrationProvider registration={data}>
            <RegistrationShell>
                <Outlet />
            </RegistrationShell>
        </RegistrationProvider>
    )
}
