import type { MerchantRegistration, MerchantType } from "../types/merchant-registration.types"

export type StepId =
    "business" | "identity" | "legal-entity" | "service" | "categories" | "outlets" | "documents" | "payout" | "review"

export type RegistrationStep = {
    id: StepId
    segment: string
    label: string
    shortLabel: string
    description: string
}

export const REGISTRATION_BASE = "/app/registration"

export const REGISTRATION_STEPS: RegistrationStep[] = [
    {
        id: "business",
        segment: "business",
        label: "Data usaha",
        shortLabel: "Usaha",
        description: "Nama, jenis, dan deskripsi usaha Anda.",
    },
    {
        id: "identity",
        segment: "identity",
        label: "Identitas pemilik",
        shortLabel: "Identitas",
        description: "Data pemilik yang bertanggung jawab.",
    },
    {
        id: "legal-entity",
        segment: "legal-entity",
        label: "Badan usaha",
        shortLabel: "Badan usaha",
        description: "Legalitas badan usaha Anda.",
    },
    {
        id: "service",
        segment: "service",
        label: "Layanan",
        shortLabel: "Layanan",
        description: "Pilih layanan JualAntar yang sesuai.",
    },
    {
        id: "categories",
        segment: "categories",
        label: "Kategori",
        shortLabel: "Kategori",
        description: "Pilih 1–3 kategori usaha.",
    },
    {
        id: "outlets",
        segment: "outlets",
        label: "Outlet & lokasi",
        shortLabel: "Outlet",
        description: "Lokasi dan jam operasional outlet.",
    },
    {
        id: "documents",
        segment: "documents",
        label: "Logo & dokumen",
        shortLabel: "Dokumen",
        description: "Logo dan dokumen pendukung (opsional).",
    },
    {
        id: "payout",
        segment: "payout",
        label: "Rekening pencairan",
        shortLabel: "Rekening",
        description: "Rekening untuk menerima pencairan.",
    },
    {
        id: "review",
        segment: "review",
        label: "Tinjau & kirim",
        shortLabel: "Tinjau",
        description: "Periksa kembali sebelum dikirim.",
    },
]

export function stepPath(step: RegistrationStep): string {
    return `${REGISTRATION_BASE}/${step.segment}`
}

export function stepPathById(id: StepId): string {
    const step = REGISTRATION_STEPS.find((candidate) => candidate.id === id)

    return step === undefined ? REGISTRATION_BASE : stepPath(step)
}

export function applicableSteps(type: MerchantType | null | undefined): RegistrationStep[] {
    return REGISTRATION_STEPS.filter((step) => step.id !== "legal-entity" || type === "company")
}

export function isStepComplete(step: RegistrationStep, registration: MerchantRegistration): boolean {
    switch (step.id) {
        case "business":
            return (
                registration.business_name !== null && registration.business_name !== "" && registration.type !== null
            )
        case "identity":
            return registration.identity !== null
        case "legal-entity":
            return registration.type !== "company" || registration.legal_entity !== null
        case "service":
            return registration.service !== null
        case "categories":
            return registration.categories.length >= 1 && registration.categories.length <= 3
        case "outlets":
            return registration.outlets.some((outlet) => outlet.status === "active")
        case "documents":
            return true
        case "payout":
            return registration.payout_accounts.length > 0
        case "review":
            return false
        default:
            return false
    }
}

export function firstIncompleteStep(registration: MerchantRegistration): StepId {
    const steps = applicableSteps(registration.type)

    for (const step of steps) {
        if (step.id === "review") {
            continue
        }

        if (!isStepComplete(step, registration)) {
            return step.id
        }
    }

    return "review"
}

export function stepProgress(registration: MerchantRegistration) {
    const steps = applicableSteps(registration.type)
    const trackable = steps.filter((step) => step.id !== "review" && step.id !== "documents")
    const completed = trackable.filter((step) => isStepComplete(step, registration)).length

    return {
        completed,
        total: trackable.length,
        percentage: trackable.length === 0 ? 0 : Math.round((completed / trackable.length) * 100),
    }
}

const REJECTION_STAGE_STEPS: Record<string, StepId> = {
    merchant: "business",
    identity: "identity",
    legal_entity: "legal-entity",
    outlet: "outlets",
    document: "documents",
    payout: "payout",
}

/**
 * Resolve which wizard step the merchant should fix after a rejection.
 * Falls back to the first incomplete step when the stage is unknown.
 */
export function stepForRejectionStage(stage: string | null | undefined, registration: MerchantRegistration): StepId {
    if (stage !== null && stage !== undefined && stage in REJECTION_STAGE_STEPS) {
        return REJECTION_STAGE_STEPS[stage]
    }

    return firstIncompleteStep(registration)
}
