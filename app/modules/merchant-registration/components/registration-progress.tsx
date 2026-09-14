import { cn } from "~/lib/utils"

import { useRegistrationContext } from "./registration-context"
import { stepProgress } from "../utils/steps"

export function RegistrationProgress() {
    const { registration, navigation } = useRegistrationContext()
    const progress = stepProgress(registration)

    return (
        <div className="px-4 pb-3">
            <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">
                    Langkah {navigation.activeIndex + 1} dari {navigation.steps.length}
                </span>
                <span className="text-muted-foreground">
                    {progress.completed}/{progress.total} selesai
                </span>
            </div>
            <div className="mt-2 flex gap-1" aria-hidden="true">
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
