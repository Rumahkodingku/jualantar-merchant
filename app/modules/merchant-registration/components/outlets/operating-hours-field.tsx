import { CalendarCheckIcon, CopyIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useFormContext } from "react-hook-form"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Switch } from "~/components/ui/switch"
import { DAY_KEYS, DAY_LABELS } from "../../schemas/outlet.schema"
import type { DayKey } from "../../types/merchant-registration.types"

type HoursSlot = { open: string; close: string }
type HoursRecord = Record<string, HoursSlot[]>
type SlotError = { open?: { message?: string }; close?: { message?: string } }
type HoursErrors = Record<string, (SlotError | undefined)[] | undefined>

const DEFAULT_SLOT: HoursSlot = { open: "08:00", close: "17:00" }

export function OperatingHoursField() {
    const { watch, setValue, trigger, formState } = useFormContext()
    const hours = (watch("hours") ?? {}) as HoursRecord
    const hoursErrors = (formState.errors.hours ?? {}) as unknown as HoursErrors

    const commit = (next: HoursRecord) => {
        void setValue("hours", next, { shouldDirty: true })

        const paths: string[] = []

        for (const [day, slots] of Object.entries(next)) {
            slots.forEach((_, index) => {
                paths.push(`hours.${day}.${index}.open`, `hours.${day}.${index}.close`)
            })
        }

        void trigger(paths.length > 0 ? paths : "hours")
    }

    const toggleDay = (day: DayKey, open: boolean) => {
        const next: HoursRecord = { ...hours }

        if (open) {
            next[day] = [{ ...DEFAULT_SLOT }]
        } else {
            delete next[day]
        }

        commit(next)
    }

    const updateTime = (day: DayKey, index: number, key: "open" | "close", value: string) => {
        const slots = hours[day]

        if (slots === undefined) {
            return
        }

        commit({ ...hours, [day]: slots.map((slot, i) => (i === index ? { ...slot, [key]: value } : slot)) })
    }

    const addSlot = (day: DayKey) => {
        const slots = hours[day]

        if (slots === undefined) {
            return
        }

        commit({ ...hours, [day]: [...slots, { ...DEFAULT_SLOT }] })
    }

    const removeSlot = (day: DayKey, index: number) => {
        const slots = hours[day]

        if (slots === undefined || slots.length <= 1) {
            return
        }

        commit({ ...hours, [day]: slots.filter((_, i) => i !== index) })
    }

    const applyToAllDays = (day: DayKey) => {
        const slots = hours[day]

        if (slots === undefined) {
            return
        }

        const next: HoursRecord = {}

        for (const key of DAY_KEYS) {
            next[key] = slots.map((slot) => ({ ...slot }))
        }

        commit(next)
    }

    const openAllDays = () => {
        const next: HoursRecord = { ...hours }

        for (const key of DAY_KEYS) {
            if (next[key] === undefined) {
                next[key] = [{ ...DEFAULT_SLOT }]
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
                    const slots = hours[day]
                    const open = slots !== undefined

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
                                    {slots.map((slot, index) => {
                                        const slotError = hoursErrors[day]?.[index]
                                        const errorMessage = slotError?.close?.message ?? slotError?.open?.message

                                        return (
                                            <div key={index} className="flex flex-col gap-1">
                                                <div className="flex items-end gap-2">
                                                    <div className="flex flex-1 flex-col gap-1">
                                                        <label
                                                            htmlFor={`hours-${day}-${index}-open`}
                                                            className="text-xs text-muted-foreground"
                                                        >
                                                            Jam buka
                                                        </label>
                                                        <Input
                                                            id={`hours-${day}-${index}-open`}
                                                            type="time"
                                                            className="h-10"
                                                            value={slot.open}
                                                            aria-invalid={slotError?.open !== undefined}
                                                            onChange={(event) =>
                                                                updateTime(day, index, "open", event.target.value)
                                                            }
                                                        />
                                                    </div>
                                                    <span className="pb-3 text-xs text-muted-foreground">s/d</span>
                                                    <div className="flex flex-1 flex-col gap-1">
                                                        <label
                                                            htmlFor={`hours-${day}-${index}-close`}
                                                            className="text-xs text-muted-foreground"
                                                        >
                                                            Jam tutup
                                                        </label>
                                                        <Input
                                                            id={`hours-${day}-${index}-close`}
                                                            type="time"
                                                            className="h-10"
                                                            value={slot.close}
                                                            aria-invalid={slotError?.close !== undefined}
                                                            onChange={(event) =>
                                                                updateTime(day, index, "close", event.target.value)
                                                            }
                                                        />
                                                    </div>
                                                    {slots.length > 1 ? (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            className="mb-1.5 text-destructive hover:text-destructive"
                                                            aria-label={`Hapus jam ke-${index + 1} hari ${DAY_LABELS[day]}`}
                                                            onClick={() => removeSlot(day, index)}
                                                        >
                                                            <Trash2Icon />
                                                        </Button>
                                                    ) : null}
                                                </div>
                                                {errorMessage !== undefined ? (
                                                    <p className="text-xs text-destructive">{errorMessage}</p>
                                                ) : null}
                                            </div>
                                        )
                                    })}

                                    <div className="flex flex-wrap gap-2">
                                        <Button type="button" variant="outline" size="sm" onClick={() => addSlot(day)}>
                                            <PlusIcon /> Tambah jam
                                        </Button>
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
