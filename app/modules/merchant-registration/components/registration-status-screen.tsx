import { AuthLayout } from "~/components/layouts/auth-layout"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { useLogout } from "~/modules/auth"
import { AdminNote } from "./admin-note"
import { useCreateRegistration } from "../services/merchant-registration.mutations"
import { rejectionNote } from "../utils/rejection-note"
import { statusPresentationFor } from "../utils/status-presentation"
import type { MerchantRegistration } from "../types/merchant-registration.types"
import { Text } from "~/components/ui/text"
import { useNavigate } from "react-router"

export function RegistrationStatusScreen({ registration }: { registration: MerchantRegistration }) {
    const navigate = useNavigate()
    const logout = useLogout()
    const createDraft = useCreateRegistration()
    const presentation = statusPresentationFor(registration)
    const Icon = presentation.icon
    const note = rejectionNote(registration)
    const canReapply = registration.status === "rejected"

    return (
        <AuthLayout title={presentation.title} description={presentation.description}>
            <div className="flex flex-col gap-6">
                <div className={`flex size-14 items-center justify-center rounded-2xl ${presentation.tone}`}>
                    <Icon className="size-7" aria-hidden="true" />
                </div>

                {note !== null ? <AdminNote note={note} /> : null}

                <div className="flex w-full flex-col gap-2">
                    {canReapply ? (
                        <Button
                            size="lg"
                            className="h-11 w-full"
                            onClick={() => createDraft.mutate()}
                            disabled={createDraft.isPending}
                        >
                            {createDraft.isPending ? (
                                <>
                                    <Spinner /> Memproses…
                                </>
                            ) : (
                                "Ajukan Pendaftaran Baru"
                            )}
                        </Button>
                    ) : null}

                    <Button variant="default" size="lg" onClick={() => navigate(-1)} disabled={logout.isPending}>
                        Kembali ke halaman sebelumnya
                    </Button>
                </div>
            </div>
        </AuthLayout>
    )
}
