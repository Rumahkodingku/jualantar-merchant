import { describe, expect, it } from "vitest"

import { formToOperatingHoursPayload, normalizeOperatingHours, operatingHoursToForm } from "./operating-hours"

describe("normalizeOperatingHours", () => {
    it("treats a JSON array or nullish value as an empty schedule", () => {
        expect(normalizeOperatingHours([])).toEqual({})
        expect(normalizeOperatingHours(null)).toEqual({})
        expect(normalizeOperatingHours(undefined)).toEqual({})
        expect(normalizeOperatingHours("nope")).toEqual({})
    })

    it("passes through a schedule object", () => {
        const schedule = { monday: { is_open: true, open: "08:00", close: "22:00" } }

        expect(normalizeOperatingHours(schedule)).toEqual(schedule)
    })
})

describe("operatingHoursToForm", () => {
    it("keeps only days that are open with both times", () => {
        const result = operatingHoursToForm({
            monday: { is_open: true, open: "08:00", close: "22:00" },
            sunday: { is_open: false },
            tuesday: { is_open: true },
        })

        expect(result).toEqual({ monday: { is_open: true, open: "08:00", close: "22:00" } })
    })

    it("handles a missing schedule", () => {
        expect(operatingHoursToForm(null)).toEqual({})
    })
})

describe("formToOperatingHoursPayload", () => {
    it("always sends all seven days so the API validator accepts the payload", () => {
        const payload = formToOperatingHoursPayload({
            monday: { is_open: true, open: "08:00", close: "22:00" },
        })

        expect(Object.keys(payload)).toHaveLength(7)
        expect(payload.monday).toEqual({ is_open: true, open: "08:00", close: "22:00" })
        expect(payload.sunday).toEqual({ is_open: false })
    })

    it("marks every day closed when the form is empty", () => {
        const payload = formToOperatingHoursPayload({})

        expect(Object.values(payload).every((day) => day.is_open === false)).toBe(true)
    })
})
