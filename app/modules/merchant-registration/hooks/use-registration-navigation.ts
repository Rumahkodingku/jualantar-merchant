import { useLocation, useNavigate } from "react-router"

import type { MerchantRegistration } from "../types/merchant-registration.types"
import { applicableSteps, stepPath, type StepId } from "../utils/steps"

export function useRegistrationNavigation(registration: MerchantRegistration | undefined) {
    const location = useLocation()
    const navigate = useNavigate()
    const steps = applicableSteps(registration?.type ?? null)

    const activeIndex = steps.findIndex((step) => stepPath(step) === location.pathname)
    const activeStep = activeIndex >= 0 ? steps[activeIndex] : undefined
    const previousStep = activeIndex > 0 ? steps[activeIndex - 1] : undefined
    const nextStep = activeIndex >= 0 && activeIndex < steps.length - 1 ? steps[activeIndex + 1] : undefined

    function goToStep(id: StepId) {
        const step = steps.find((candidate) => candidate.id === id)

        if (step !== undefined) {
            void navigate(stepPath(step))
        }
    }

    function goBack() {
        if (previousStep !== undefined) {
            void navigate(stepPath(previousStep))
        }
    }

    function goNext() {
        if (nextStep !== undefined) {
            void navigate(stepPath(nextStep))
        }
    }

    return {
        steps,
        activeStep,
        activeIndex,
        previousStep,
        nextStep,
        isFirst: activeIndex === 0,
        isLast: activeIndex === steps.length - 1,
        goToStep,
        goBack,
        goNext,
    }
}
