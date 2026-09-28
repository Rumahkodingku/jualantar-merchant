export function formatDateTime(value: string | null | undefined): string {
    if (value === null || value === undefined || value === "") {
        return "-"
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return "-"
    }

    return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date)
}
