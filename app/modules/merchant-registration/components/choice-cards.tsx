import { cn } from "~/lib/utils"

export type ChoiceCardOption<T extends string> = {
    value: T
    label: string
    description?: string
    icon?: React.ReactNode
}

export function ChoiceCards<T extends string>({
    options,
    value,
    onChange,
    disabled = false,
    columns = 1,
}: {
    options: ChoiceCardOption<T>[]
    value: T | null | undefined
    onChange: (value: T) => void
    disabled?: boolean
    columns?: 1 | 2
}) {
    return (
        <div
            role="radiogroup"
            className={cn("grid gap-2", columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}
        >
            {options.map((option) => {
                const selected = option.value === value

                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={disabled}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors outline-none",
                            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                            "disabled:cursor-not-allowed disabled:opacity-60",
                            selected
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border bg-card hover:bg-muted/50"
                        )}
                    >
                        {option.icon !== undefined ? (
                            <span
                                className={cn(
                                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                                    selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}
                            >
                                {option.icon}
                            </span>
                        ) : null}
                        <span className="flex min-w-0 flex-col gap-0.5">
                            <span className="text-sm font-medium text-foreground">{option.label}</span>
                            {option.description !== undefined ? (
                                <span className="text-xs leading-relaxed text-muted-foreground">
                                    {option.description}
                                </span>
                            ) : null}
                        </span>
                    </button>
                )
            })}
        </div>
    )
}
