import {
    CheckCircle2Icon,
    CircleAlertIcon,
    ClockIcon,
    PauseCircleIcon,
    ShieldAlertIcon,
    XCircleIcon,
} from "lucide-react"

import type { MerchantRegistration } from "../types/merchant-registration.types"

export type StatusPresentation = {
    icon: React.ComponentType<{ className?: string }>
    tone: string
    title: string
    description: string
}

export function statusPresentationFor(registration: MerchantRegistration): StatusPresentation {
    if (registration.merchant_status === "suspended") {
        return {
            icon: PauseCircleIcon,
            tone: "text-orange-600 bg-orange-500/10",
            title: "Akun merchant dijeda",
            description:
                "Sementara ini merchant Anda tidak dapat menerima pesanan. Hubungi tim JualAntar untuk informasi lebih lanjut.",
        }
    }

    switch (registration.status) {
        case "pending":
        case "in_review":
            return {
                icon: ClockIcon,
                tone: "text-amber-600 bg-amber-500/10",
                title: "Pendaftaran sedang ditinjau",
                description:
                    "Data Anda sudah kami terima. Tim JualAntar akan meninjau pendaftaran sebelum usaha Anda aktif.",
            }
        case "approved":
            return {
                icon: CheckCircle2Icon,
                tone: "text-emerald-600 bg-emerald-500/10",
                title: "Usaha Anda sudah aktif",
                description:
                    "Selamat! Merchant Anda telah disetujui. Anda dapat mulai mengelola usaha dari dashboard merchant.",
            }
        case "revision_required":
            return {
                icon: CircleAlertIcon,
                tone: "text-amber-600 bg-amber-500/10",
                title: "Pendaftaran perlu diperbaiki",
                description:
                    "Beberapa data pendaftaran perlu Anda perbaiki. Periksa catatan dari tim JualAntar lalu kirim ulang.",
            }
        case "rejected":
            return {
                icon: XCircleIcon,
                tone: "text-destructive bg-destructive/10",
                title: "Pendaftaran belum disetujui",
                description:
                    "Mohon maaf, pendaftaran Anda belum dapat kami setujui. Hubungi tim JualAntar untuk informasi lebih lanjut.",
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
