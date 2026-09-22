import type { AvailabilityReason, OperationalAvailabilityStatus } from "../types/merchant-operations.types"

export type AvailabilityPresentation = {
    status: OperationalAvailabilityStatus
    label: string
    headline: string
    tone: "positive" | "neutral"
}

const PRESENTATIONS: Record<OperationalAvailabilityStatus, AvailabilityPresentation> = {
    open: {
        status: "open",
        label: "Buka",
        headline: "Siap menerima pesanan",
        tone: "positive",
    },
    closed: {
        status: "closed",
        label: "Tutup",
        headline: "Tidak menerima pesanan",
        tone: "neutral",
    },
}

export function availabilityPresentation(status: OperationalAvailabilityStatus): AvailabilityPresentation {
    return PRESENTATIONS[status]
}

const REASON_MESSAGE: Record<AvailabilityReason, string> = {
    merchant_inactive: "Merchant belum aktif.",
    merchant_suspended: "Merchant sedang ditangguhkan.",
    outlet_inactive: "Outlet sedang nonaktif.",
    outside_operating_hours: "Saat ini di luar jam operasional outlet.",
    scheduled_closed: "Outlet dijadwalkan tutup hari ini.",
}

export function availabilityReasonMessage(reason: AvailabilityReason | null): string | null {
    return reason === null ? null : REASON_MESSAGE[reason]
}
