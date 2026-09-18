import { Brand } from "~/components/brand"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Text } from "~/components/ui/text"

import { RegistrationProgress } from "./registration-progress"
import { useRegistrationContext } from "./registration-context"
import { rejectionNote, rejectionStageLabel } from "../utils/rejection-note"

export function RegistrationScreen({ children }: { children: React.ReactNode }) {
    const { registration, navigation } = useRegistrationContext()
    const step = navigation.activeStep
    const revisionNote = rejectionNote(registration)
    const stageLabel = rejectionStageLabel(registration)

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

                {registration.status === "revision_required" ? (
                    <Alert variant="destructive">
                        <AlertTitle>Pendaftaran perlu diperbaiki</AlertTitle>
                        <AlertDescription>
                            <span>
                                {revisionNote ?? "Beberapa data perlu Anda perbaiki sebelum dapat dikirim ulang."}
                            </span>
                            {stageLabel !== null ? (
                                <span className="mt-1 block text-xs opacity-80">
                                    Bagian yang perlu diperbaiki: {stageLabel}.
                                </span>
                            ) : null}
                        </AlertDescription>
                    </Alert>
                ) : null}

                {children}
            </main>
        </div>
    )
}
