import type { OperatingHours } from "~/modules/merchant-registration"

import type { OperatingHoursPayload } from "../types/merchant-operations.types"
import { DAY_KEYS } from "~/modules/merchant-registration"

/** `GET .../operating-hours` returns `[]` when the schedule is empty. */
export function normalizeOperatingHours(value: unknown): OperatingHours {
    if (value === null || value === undefined || Array.isArray(value) || typeof value !== "object") {
        return {}
    }

    return value as OperatingHours
}

export type OpenHoursRecord = Record<string, { is_open: true; open: string; close: string }>

/** Keep only open days, as the form field expects. */
export function operatingHoursToForm(schedule: OperatingHours | null | undefined): OpenHoursRecord {
    const hours: OpenHoursRecord = {}

    for (const [day, entry] of Object.entries(schedule ?? {})) {
        if (entry === null || entry.is_open !== true) {
            continue
        }

        if (typeof entry.open === "string" && typeof entry.close === "string") {
            hours[day] = { is_open: true, open: entry.open, close: entry.close }
        }
    }

    return hours
}

/**
 * The API validator iterates the submitted keys and rejects unknown days, so a
 * full seven-day payload is always sent with `is_open: false` for closed days.
 */
export function formToOperatingHoursPayload(hours: OpenHoursRecord): OperatingHoursPayload {
    const payload = {} as OperatingHoursPayload

    for (const day of DAY_KEYS) {
        const entry = hours[day]

        payload[day] =
            entry === undefined ? { is_open: false } : { is_open: true, open: entry.open, close: entry.close }
    }

    return payload
}
