export function toNumber(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined || value === "") {
        return null
    }

    const parsed = typeof value === "number" ? value : Number(value)

    return Number.isFinite(parsed) ? parsed : null
}

export function formatDecimal(value: number | string | null | undefined, fractionDigits = 2): string {
    const parsed = toNumber(value)

    if (parsed === null) {
        return "-"
    }

    return new Intl.NumberFormat("id-ID", {
        maximumFractionDigits: fractionDigits,
        minimumFractionDigits: 0,
    }).format(parsed)
}

export function formatDate(value: string | null | undefined): string {
    if (value === null || value === undefined || value === "") {
        return "-"
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return "-"
    }

    return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(date)
}
