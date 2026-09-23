export function formatIDR(value: number): string {
    return `Rp ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value)}`
}

export function formatCompactIDR(value: number): string {
    if (value >= 1_000_000) {
        const trimmed = Number((value / 1_000_000).toFixed(1))
        return `${trimmed} jt`
    }

    if (value >= 1_000) {
        const trimmed = Number((value / 1_000).toFixed(1))
        return `${trimmed} rb`
    }

    return String(value)
}

export function formatRating(value: number): string {
    return new Intl.NumberFormat("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)
}
