import { CheckCircle2Icon, ClockIcon, PauseCircleIcon, ShieldAlertIcon, XCircleIcon } from "lucide-react"
import { useNavigate } from "react-router"

import { Brand } from "~/components/brand"
import { MobileScreen } from "~/components/layouts/mobile-screen"
import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { useLogout } from "~/modules/auth"

import { useReopenRegistration } from "../services/merchant-registration.mutations"
import { stepForRejectionStage, stepPathById } from "../utils/steps"
import type { MerchantRegistration } from "../types/merchant-registration.types"

type StatusPresentation = {
    icon: React.ComponentType<{ className?: string }>
    tone: string
    title: string
    description: string
}

function presentationFor(registration: MerchantRegistration): StatusPresentation {
    switch (registration.status) {
        case "pending":
            return {
                icon: ClockIcon,
                tone: "text-amber-600 bg-amber-500/10",
                title: "Pendaftaran sedang ditinjau",
                description:
                    "Data Anda sudah kami terima. Tim JualAntar akan meninjau pendaftaran sebelum usaha Anda aktif.",
            }
        case "active":
            return {
                icon: CheckCircle2Icon,
                tone: "text-emerald-600 bg-emerald-500/10",
                title: "Usaha Anda sudah aktif",
                description:
                    "Selamat! Merchant Anda telah disetujui. Anda dapat mulai mengelola usaha dari dashboard merchant.",
            }
        case "suspended":
            return {
                icon: PauseCircleIcon,
                tone: "text-orange-600 bg-orange-500/10",
                title: "Akun merchant dijeda",
                description:
                    "Sementara ini merchant Anda tidak dapat menerima pesanan. Hubungi tim JualAntar untuk informasi lebih lanjut.",
            }
        case "rejected":
            return {
                icon: XCircleIcon,
                tone: "text-destructive bg-destructive/10",
                title: "Pendaftaran perlu diperbaiki",
                description:
                    "Beberapa data pendaftaran belum dapat kami setujui. Perbaiki data yang diminta lalu kirim ulang.",
            }
        default:
            return {
                icon: ShieldAlertIcon,
                tone: "text-muted-foreground bg-muted",
                title: "Status tidak dikenal",
                description: "Kami tidak dapat membaca status pendaftaran Anda. Coba muat ulang halaman ini.",
            }
    }
}

export function RegistrationStatusScreen({ registration }: { registration: MerchantRegistration }) {
    const logout = useLogout()
    const reopen = useReopenRegistration()
    const navigate = useNavigate()
    const presentation = presentationFor(registration)
    const Icon = presentation.icon

    function handleReopen() {
        reopen.mutate(undefined, {
            onSuccess: () => {
                const step = stepForRejectionStage(registration.rejection_stage, registration)
                void navigate(stepPathById(step))
            },
        })
    }

    return (
        <MobileScreen>
            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
                <Brand size={28} />
                <div className={`flex size-16 items-center justify-center rounded-2xl ${presentation.tone}`}>
                    <Icon className="size-8" />
                </div>
                <div className="flex flex-col gap-2">
                    <h1 className="font-heading text-xl font-semibold tracking-tight text-balance">
                        {presentation.title}
                    </h1>
                    <p className="text-sm leading-relaxed text-muted-foreground">{presentation.description}</p>
                </div>

                {registration.status === "rejected" && registration.rejection_reason ? (
                    <div className="w-full rounded-xl border bg-muted/40 px-4 py-3 text-left">
                        <p className="text-xs font-medium text-muted-foreground">Catatan dari tim JualAntar</p>
                        <p className="mt-1 text-sm text-foreground">{registration.rejection_reason}</p>
                    </div>
                ) : null}

                <div className="mt-auto flex w-full flex-col gap-2">
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
        </MobileScreen>
    )
}
