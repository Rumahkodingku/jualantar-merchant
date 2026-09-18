import type { MerchantRegistration } from "../types/merchant-registration.types"
import { REGISTRATION_STEPS, REJECTION_STAGE_STEPS } from "./steps"

/**
 * The note the merchant should see for a rejected or revision-required
 * application. A final rejection shows the admin's decision reason, falling
 * back to the latest revision note when none was recorded.
 */
export function rejectionNote(registration: MerchantRegistration): string | null {
    if (registration.status === "rejected") {
        return registration.decision_reason ?? registration.rejection_reason ?? null
    }

    if (registration.status === "revision_required") {
        return registration.rejection_reason ?? null
    }

    return null
}

/**
 * Human-readable label of the wizard step that needs to be corrected for a
 * revision, or null when the backend did not provide a known component stage.
 */
export function rejectionStageLabel(registration: MerchantRegistration): string | null {
    const stage = registration.rejection_stage

    if (stage === null || stage === undefined || !(stage in REJECTION_STAGE_STEPS)) {
        return null
    }

    const stepId = REJECTION_STAGE_STEPS[stage]

    return REGISTRATION_STEPS.find((step) => step.id === stepId)?.label ?? null
}
