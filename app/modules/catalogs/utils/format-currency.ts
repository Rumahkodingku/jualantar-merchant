export function formatCurrency(value: number | null | undefined): string {
    if (value === null || value === undefined) {
        return "-"
    }

    return `Rp ${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value)}`
}
