import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

import { useRegistrationContext } from "./registration-context"
import { stepProgress } from "../utils/steps"

export function RegistrationProgress() {
    const { registration, navigation } = useRegistrationContext()
    const progress = stepProgress(registration)

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <Text as="span" variant="xs" weight="medium">
                    Langkah {navigation.activeIndex + 1} dari {navigation.steps.length}
                </Text>
                <Text as="span" variant="xs" className="text-muted-foreground">
                    {progress.completed}/{progress.total} selesai
                </Text>
            </div>
            <div className="flex gap-1" aria-hidden="true">
                {navigation.steps.map((step, index) => (
                    <span
                        key={step.id}
                        className={cn(
                            "h-1.5 flex-1 rounded-full transition-colors",
                            index < navigation.activeIndex
                                ? "bg-primary"
                                : index === navigation.activeIndex
                                  ? "bg-primary/60"
                                  : "bg-muted"
                        )}
                    />
                ))}
            </div>
        </div>
    )
}
