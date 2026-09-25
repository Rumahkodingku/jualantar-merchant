import { isStepComplete, REGISTRATION_STEPS, type StepId } from "./steps"
import type { MerchantRegistration } from "../types/merchant-registration.types"

export type SectionStatus = "complete" | "incomplete" | "optional"

export function stepMeta(id: StepId) {
    return REGISTRATION_STEPS.find((step) => step.id === id)
}

export function sectionStatus(id: StepId, registration: MerchantRegistration): SectionStatus {
    const step = stepMeta(id)

    if (step === undefined) {
        return "incomplete"
    }

    return isStepComplete(step, registration) ? "complete" : "incomplete"
}
