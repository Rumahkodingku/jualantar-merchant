import { useFormContext } from "react-hook-form"

import { Input } from "~/components/ui/input"
import { cn } from "~/lib/utils"

import { DAY_KEYS, DAY_LABELS } from "../schemas/outlet.schema"

type HoursRecord = Record<string, { open: string; close: string }>

export function OperatingHoursField() {
    const { watch, setValue } = useFormContext()
    const hours = (watch("hours") ?? {}) as HoursRecord

    function toggleDay(day: string, open: boolean) {
        const next: HoursRecord = { ...hours }

        if (open) {
            next[day] = { open: "08:00", close: "17:00" }
        } else {
            delete next[day]
        }

        void setValue("hours", next, { shouldDirty: true, shouldValidate: true })
    }

    function updateTime(day: string, key: "open" | "close", value: string) {
        const current = hours[day]

        if (current === undefined) {
            return
        }

        void setValue(
            "hours",
            { ...hours, [day]: { ...current, [key]: value } },
            { shouldDirty: true, shouldValidate: true }
        )
    }

    return (
        <div className="flex flex-col divide-y rounded-xl border">
            {DAY_KEYS.map((day) => {
                const slot = hours[day]
                const open = slot !== undefined

                return (
                    <div key={day} className="flex flex-col gap-2 p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{DAY_LABELS[day]}</span>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={open}
                                onClick={() => toggleDay(day, !open)}
                                className={cn(
                                    "inline-flex h-7 items-center rounded-full px-2.5 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                                    open ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}
                            >
                                {open ? "Buka" : "Tutup"}
                            </button>
                        </div>

                        {open ? (
                            <div className="flex items-center gap-2">
                                <Input
                                    type="time"
                                    aria-label={`Jam buka ${DAY_LABELS[day]}`}
                                    className="h-10 flex-1"
                                    value={slot.open}
                                    onChange={(event) => updateTime(day, "open", event.target.value)}
                                />
                                <span className="text-xs text-muted-foreground">s/d</span>
                                <Input
                                    type="time"
                                    aria-label={`Jam tutup ${DAY_LABELS[day]}`}
                                    className="h-10 flex-1"
                                    value={slot.close}
                                    onChange={(event) => updateTime(day, "close", event.target.value)}
                                />
                            </div>
                        ) : null}
                    </div>
                )
            })}
        </div>
    )
}
