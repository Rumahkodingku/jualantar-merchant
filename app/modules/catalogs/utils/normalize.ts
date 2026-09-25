export function normalizePrice(value: unknown): number | null {
    if (value === null || value === undefined || value === "") {
        return null
    }

    const parsed = typeof value === "number" ? value : Number(value)

    return Number.isFinite(parsed) ? parsed : null
}

export function normalizeRequiredPrice(value: unknown): number {
    return normalizePrice(value) ?? 0
}
