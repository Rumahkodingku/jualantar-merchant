import { Navigate } from "react-router"

import { useRegistrationContext } from "../components/registration-context"
import { applicableSteps, firstIncompleteStep, stepPath } from "../utils/steps"

export function RegistrationPage() {
    const { registration } = useRegistrationContext()
    const steps = applicableSteps(registration.type)
    const targetId = firstIncompleteStep(registration)
    const target = steps.find((step) => step.id === targetId) ?? steps[0]

    return <Navigate to={stepPath(target)} replace />
}
