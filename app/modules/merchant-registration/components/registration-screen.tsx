import { Brand } from "~/components/brand"
import { Text } from "~/components/ui/text"

import { RegistrationProgress } from "./registration-progress"
import { useRegistrationContext } from "./registration-context"

export function RegistrationScreen({ children }: { children: React.ReactNode }) {
    const { navigation } = useRegistrationContext()
    const step = navigation.activeStep

    return (
        <div className="flex min-h-svh flex-col bg-muted/40">
            <header className="px-6 pt-8">
                <Brand />
            </header>

            <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-8">
                <div className="flex flex-col gap-3">
                    <RegistrationProgress />
                    <div className="flex flex-col gap-1.5">
                        <Text as="h1" variant="2xl" weight="bold" className="tracking-tight text-balance">
                            {step?.label ?? "Pendaftaran merchant"}
                        </Text>
                        {step?.description !== undefined ? (
                            <Text variant="sm" className="leading-relaxed text-pretty text-muted-foreground">
                                {step.description}
                            </Text>
                        ) : null}
                    </div>
                </div>

                {children}
            </main>
        </div>
    )
}
