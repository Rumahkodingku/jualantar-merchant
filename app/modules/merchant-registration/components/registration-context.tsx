import { createContext, useContext } from "react"

import type { MerchantRegistration } from "../types/merchant-registration.types"
import { useRegistrationNavigation } from "../hooks/use-registration-navigation"

type RegistrationContextValue = {
    registration: MerchantRegistration
    navigation: ReturnType<typeof useRegistrationNavigation>
}

const RegistrationContext = createContext<RegistrationContextValue | null>(null)

export function RegistrationProvider({
    registration,
    children,
}: {
    registration: MerchantRegistration
    children: React.ReactNode
}) {
    const navigation = useRegistrationNavigation(registration)

    return <RegistrationContext.Provider value={{ registration, navigation }}>{children}</RegistrationContext.Provider>
}

export function useRegistrationContext(): RegistrationContextValue {
    const context = useContext(RegistrationContext)

    if (context === null) {
        throw new Error("useRegistrationContext harus dipakai di dalam RegistrationProvider.")
    }

    return context
}
