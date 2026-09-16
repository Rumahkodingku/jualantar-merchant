import { Navigate } from "react-router"

import { useRegistrationContext } from "../components/registration-context"
import { applicableSteps, firstIncompleteStep, stepForRejectionStage, stepPath } from "../utils/steps"

export function RegistrationPage() {
    const { registration } = useRegistrationContext()
    const steps = applicableSteps(registration.type)
    const targetId =
        registration.status === "revision_required"
            ? stepForRejectionStage(registration.rejection_stage, registration)
            : firstIncompleteStep(registration)
    const target = steps.find((step) => step.id === targetId) ?? steps[0]

    return <Navigate to={stepPath(target)} replace />
}
