import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

import { STEPS } from "./steps"

/**
 * Where the merchant is in the six steps, at a glance.
 *
 * The bar is decorative — the step's own title is spelled out in the heading
 * and the footer button says what happens next — so the segment row is hidden
 * from assistive technology rather than reading out six unlabelled bars.
 */
export function Stepper({ stepIndex }: { stepIndex: number }) {
    const step = STEPS[stepIndex] ?? STEPS[0]

    return (
        <div className="mt-2 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
                <Text variant="xs" weight="semibold" className="text-muted-foreground">
                    Langkah {stepIndex + 1} dari {STEPS.length}
                </Text>
                <Text variant="xs" weight="semibold">
                    {step.label}
                </Text>
            </div>

            <div className="flex gap-1.5" aria-hidden="true">
                {STEPS.map((item, index) => (
                    <span
                        key={item.id}
                        className={cn(
                            "h-1.5 flex-1 rounded-full transition-colors",
                            index <= stepIndex ? "bg-primary" : "bg-muted"
                        )}
                    />
                ))}
            </div>
        </div>
    )
}
