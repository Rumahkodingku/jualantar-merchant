import type { DayKey, MerchantRegistration, OperatingHours } from "../types/merchant-registration.types"

const DAY_ORDER: DayKey[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

const DAY_SHORT: Record<DayKey, string> = {
    monday: "Sen",
    tuesday: "Sel",
    wednesday: "Rab",
    thursday: "Kam",
    friday: "Jum",
    saturday: "Sab",
    sunday: "Min",
}

type HoursGroup = { start: number; end: number; open: string; close: string }

function formatTime(value: string): string {
    return value.replace(":", ".")
}

function groupHours(hours: OperatingHours): HoursGroup[] {
    const groups: HoursGroup[] = []

    DAY_ORDER.forEach((day, index) => {
        const schedule = hours[day]

        if (schedule === undefined || schedule.is_open !== true) {
            return
        }

        const open = schedule.open ?? ""
        const close = schedule.close ?? ""

        const last = groups[groups.length - 1]

        if (last !== undefined && last.end === index - 1 && last.open === open && last.close === close) {
            last.end = index
        } else {
            groups.push({ start: index, end: index, open, close })
        }
    })

    return groups
}

export function operatingHoursSummary(hours: OperatingHours | null): string {
    if (hours === null) {
        return "Belum diatur"
    }

    const groups = groupHours(hours)

    if (groups.length === 0) {
        return "Belum diatur"
    }

    const only = groups[0]

    if (groups.length === 1 && only.start === 0 && only.end === 6) {
        return `Setiap hari ${formatTime(only.open)}–${formatTime(only.close)}`
    }

    return groups
        .map((group) => {
            const start = DAY_SHORT[DAY_ORDER[group.start]]
            const end = DAY_SHORT[DAY_ORDER[group.end]]
            const label = group.start === group.end ? start : `${start}–${end}`

            return `${label} ${formatTime(group.open)}–${formatTime(group.close)}`
        })
        .join(", ")
}

export function serviceAreaLabel(
    type: MerchantRegistration["outlets"][number]["service_area_type"],
    radius: number | null
): string {
    return type === "radius" ? `Radius ${radius ?? "-"} km` : `Area ${type}`
}
