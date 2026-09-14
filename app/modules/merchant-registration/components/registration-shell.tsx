import { MobileScreen } from "~/components/layouts/mobile-screen"
import { ScreenHeader } from "~/components/layouts/screen-header"

import { RegistrationProgress } from "./registration-progress"
import { useRegistrationContext } from "./registration-context"

export function RegistrationShell({ children }: { children: React.ReactNode }) {
    const { navigation } = useRegistrationContext()
    const step = navigation.activeStep

    return (
        <MobileScreen>
            <ScreenHeader
                title={step?.label ?? "Pendaftaran merchant"}
                description={step?.description}
                onBack={navigation.isFirst ? undefined : navigation.goBack}
            >
                <RegistrationProgress />
            </ScreenHeader>
            <div className="flex flex-1 flex-col">{children}</div>
        </MobileScreen>
    )
}
