import type { MerchantStatus } from "../types/merchant-operations.types"

export type MerchantStatusAction = "activate" | "suspend" | "reactivate"

export type MerchantStatusPresentation = {
    status: MerchantStatus
    label: string
    indicator: string
    description: string
    tone: "positive" | "neutral" | "negative"
    actions: MerchantStatusAction[]
}

const PRESENTATIONS: Record<MerchantStatus, MerchantStatusPresentation> = {
    inactive: {
        status: "inactive",
        label: "Tidak Aktif",
        indicator: "⚪",
        description: "Merchant belum aktif. Seluruh outlet tidak dapat menerima pesanan sampai merchant diaktifkan.",
        tone: "neutral",
        actions: ["activate"],
    },
    active: {
        status: "active",
        label: "Aktif",
        indicator: "🟢",
        description:
            "Merchant aktif. Outlet dapat menerima pesanan selama outlet aktif dan berada dalam jam operasional.",
        tone: "positive",
        actions: ["suspend"],
    },
    suspended: {
        status: "suspended",
        label: "Ditangguhkan",
        indicator: "🔴",
        description:
            "Merchant ditangguhkan. Seluruh outlet berhenti menerima pesanan sampai merchant diaktifkan kembali.",
        tone: "negative",
        actions: ["reactivate"],
    },
}

export function merchantStatusPresentation(status: MerchantStatus): MerchantStatusPresentation {
    return PRESENTATIONS[status]
}

export const MERCHANT_STATUS_ACTION_LABEL: Record<MerchantStatusAction, string> = {
    activate: "Aktifkan Merchant",
    suspend: "Suspend Merchant",
    reactivate: "Aktifkan Kembali",
}
