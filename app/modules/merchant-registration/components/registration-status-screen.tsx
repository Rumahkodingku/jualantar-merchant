import { AuthLayout } from "~/components/layouts/auth-layout"
import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import { useLogout } from "~/modules/auth"
import { statusPresentationFor } from "../utils/status-presentation"
import type { MerchantRegistration } from "../types/merchant-registration.types"

export function RegistrationStatusScreen({ registration }: { registration: MerchantRegistration }) {
    const logout = useLogout()
    const presentation = statusPresentationFor(registration)
    const Icon = presentation.icon

    return (
        <AuthLayout title={presentation.title} description={presentation.description}>
            <div className="flex flex-col gap-6">
                <div className={`flex size-14 items-center justify-center rounded-2xl ${presentation.tone}`}>
                    <Icon className="size-7" aria-hidden="true" />
                </div>

                {registration.rejection_reason ? (
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
