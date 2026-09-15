import { useNavigate } from "react-router"
import { AuthLayout } from "~/components/layouts/auth-layout"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"
import { useLogout } from "~/modules/auth"
import { useReopenRegistration } from "../services/merchant-registration.mutations"
import { stepForRejectionStage, stepPathById } from "../utils/steps"
import { statusPresentationFor } from "../utils/status-presentation"
import type { MerchantRegistration } from "../types/merchant-registration.types"

export function RegistrationStatusScreen({ registration }: { registration: MerchantRegistration }) {
    const logout = useLogout()
    const reopen = useReopenRegistration()
    const navigate = useNavigate()
    const presentation = statusPresentationFor(registration)
    const Icon = presentation.icon

    const handleReopen = () => {
        reopen.mutate(undefined, {
            onSuccess: () => {
                const step = stepForRejectionStage(registration.rejection_stage, registration)
                void navigate(stepPathById(step))
            },
        })
    }

    return (
        <AuthLayout title={presentation.title} description={presentation.description}>
            <div className="flex flex-col gap-6">
                <div className={`flex size-14 items-center justify-center rounded-2xl ${presentation.tone}`}>
                    <Icon className="size-7" aria-hidden="true" />
                </div>

                {registration.status === "rejected" && registration.rejection_reason ? (
                    <div className="w-full rounded-xl border bg-muted/40 px-4 py-3">
                        <Text variant="xs" weight="medium" className="text-muted-foreground">
                            Catatan dari tim JualAntar
                        </Text>
                        <Text variant="sm" className="mt-1">
                            {registration.rejection_reason}
                        </Text>
                    </div>
                ) : null}

                <div className="flex w-full flex-col gap-2">
                    {registration.status === "rejected" ? (
                        <Button size="lg" className="h-11 w-full" onClick={handleReopen} disabled={reopen.isPending}>
                            {reopen.isPending ? (
                                <>
                                    <Spinner /> Menyiapkan…
                                </>
                            ) : (
                                "Perbaiki & kirim ulang"
                            )}
                        </Button>
                    ) : null}
                    <Button
                        variant="outline"
                        size="lg"
                        className="h-11 w-full"
                        onClick={() => logout.mutate()}
                        disabled={logout.isPending}
                    >
                        Keluar
                    </Button>
                </div>
            </div>
        </AuthLayout>
    )
}
