import type { OperationalOutlet } from "~/modules/merchant-operations"

type OutletGeography = OperationalOutlet["geography"]

const REGION_ORDER = ["village", "district", "regency", "province"] as const

/**
 * The geography payload is four independent name strings, and Indonesian
 * administrative names frequently repeat across levels (a kelurahan named after
 * its kecamatan, a kecamatan named after its kabupaten). Consecutive duplicates
 * are collapsed so the joined line reads as a real address instead of repeating
 * the same place three times.
 */
export function formatGeography(geography: OutletGeography): string {
    if (geography === null || geography === undefined) {
        return ""
    }

    const parts: string[] = []

    for (const level of REGION_ORDER) {
        const name = geography[level]?.trim() ?? ""

        if (name === "" || parts[parts.length - 1] === name) {
            continue
        }

        parts.push(name)
    }

    return parts.join(", ")
}

/**
 * The street address joined with the region line, falling back to whatever is
 * still available so a partially hydrated outlet never renders an empty block.
 */
export function formatOutletLocation(outlet: OperationalOutlet | null | undefined): string {
    if (outlet === null || outlet === undefined) {
        return ""
    }

    const street = outlet.address.trim()
    const region = formatGeography(outlet.geography)

    if (street !== "" && region !== "") {
        return `${street}, ${region}`
    }

    return street !== "" ? street : region
}
