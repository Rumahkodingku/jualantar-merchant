import { CalendarCheckIcon, CopyIcon } from "lucide-react"
import { useFormContext } from "react-hook-form"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Switch } from "~/components/ui/switch"
import { DAY_KEYS, DAY_LABELS } from "../../schemas/outlet.schema"
import type { DayKey } from "../../types/merchant-registration.types"

type HoursDay = { is_open: boolean; open: string; close: string }
type HoursRecord = Record<string, HoursDay>
type DayError = { open?: { message?: string }; close?: { message?: string } }
type HoursErrors = Record<string, DayError | undefined>

const DEFAULT_DAY: HoursDay = { is_open: true, open: "08:00", close: "17:00" }

export function OperatingHoursField() {
    const { watch, setValue, trigger, formState } = useFormContext()
    const hours = (watch("hours") ?? {}) as HoursRecord
    const hoursErrors = (formState.errors.hours ?? {}) as unknown as HoursErrors

    const commit = (next: HoursRecord) => {
        void setValue("hours", next, { shouldDirty: true })

        const paths: string[] = []

        for (const day of Object.keys(next)) {
            paths.push(`hours.${day}.open`, `hours.${day}.close`)
        }

        void trigger(paths.length > 0 ? paths : "hours")
    }

    const toggleDay = (day: DayKey, open: boolean) => {
        const next: HoursRecord = { ...hours }

        if (open) {
            next[day] = { ...DEFAULT_DAY }
        } else {
            delete next[day]
        }

        commit(next)
    }

    const updateTime = (day: DayKey, key: "open" | "close", value: string) => {
        const schedule = hours[day]

        if (schedule === undefined) {
            return
        }

        commit({ ...hours, [day]: { ...schedule, [key]: value } })
    }

    const applyToAllDays = (day: DayKey) => {
        const schedule = hours[day]

        if (schedule === undefined) {
            return
        }

        const next: HoursRecord = {}

        for (const key of DAY_KEYS) {
            next[key] = { ...schedule }
        }

        commit(next)
    }

    const openAllDays = () => {
        const next: HoursRecord = { ...hours }

        for (const key of DAY_KEYS) {
            if (next[key] === undefined) {
                next[key] = { ...DEFAULT_DAY }
            }
        }

        commit(next)
    }

    const closeAllDays = () => {
        commit({})
    }

    const hasAnyOpen = DAY_KEYS.some((day) => hours[day] !== undefined)

    return (
        <div className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
                Atur jadwal buka outlet setiap hari. Aktifkan hari, lalu isi jam buka &amp; tutup.
            </p>

            <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={openAllDays}>
                    <CalendarCheckIcon /> Buka semua hari
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={closeAllDays} disabled={!hasAnyOpen}>
                    Tutup semua hari
                </Button>
            </div>

            <div className="flex flex-col divide-y rounded-xl border">
                {DAY_KEYS.map((day) => {
                    const schedule = hours[day]
                    const open = schedule !== undefined
                    const dayError = hoursErrors[day]

                    return (
                        <div key={day} className="flex flex-col gap-3 p-3">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-sm font-medium">{DAY_LABELS[day]}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{open ? "Buka" : "Tutup"}</span>
                                    <Switch
                                        checked={open}
                                        onCheckedChange={(checked) => toggleDay(day, checked)}
                                        aria-label={`Buka ${DAY_LABELS[day]}`}
                                    />
                                </div>
                            </div>

                            {open ? (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-end gap-2">
                                        <div className="flex flex-1 flex-col gap-1">
                                            <label
                                                htmlFor={`hours-${day}-open`}
                                                className="text-xs text-muted-foreground"
                                            >
                                                Jam buka
                                            </label>
                                            <Input
                                                id={`hours-${day}-open`}
                                                type="time"
                                                className="h-10"
                                                value={schedule.open}
                                                aria-invalid={dayError?.open !== undefined}
                                                onChange={(event) => updateTime(day, "open", event.target.value)}
                                            />
                                        </div>
                                        <span className="pb-3 text-xs text-muted-foreground">s/d</span>
                                        <div className="flex flex-1 flex-col gap-1">
                                            <label
                                                htmlFor={`hours-${day}-close`}
                                                className="text-xs text-muted-foreground"
                                            >
                                                Jam tutup
                                            </label>
                                            <Input
                                                id={`hours-${day}-close`}
                                                type="time"
                                                className="h-10"
                                                value={schedule.close}
                                                aria-invalid={dayError?.close !== undefined}
                                                onChange={(event) => updateTime(day, "close", event.target.value)}
                                            />
                                        </div>
                                    </div>
                                    {dayError?.open?.message !== undefined ? (
                                        <p className="text-xs text-destructive">{dayError.open.message}</p>
                                    ) : null}
                                    {dayError?.close?.message !== undefined ? (
                                        <p className="text-xs text-destructive">{dayError.close.message}</p>
                                    ) : null}

                                    <div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => applyToAllDays(day)}
                                        >
                                            <CopyIcon /> Terapkan ke semua hari
                                        </Button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
