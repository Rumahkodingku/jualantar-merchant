import { ApiError, type ApiErrorKind } from "~/lib/api"

const MESSAGES: Partial<Record<ApiErrorKind, string>> = {
    unauthenticated: "Sesi Anda berakhir. Silakan masuk kembali.",
    forbidden: "Anda tidak memiliki akses untuk melakukan tindakan ini.",
    not_found: "Data tidak ditemukan.",
    rate_limited: "Terlalu banyak permintaan. Coba lagi sebentar lagi.",
    server: "Terjadi kesalahan pada server. Coba lagi.",
    network: "Periksa koneksi internet Anda lalu coba lagi. Perubahan belum tersimpan.",
}

export function catalogErrorMessage(error: unknown, fallback = "Terjadi kesalahan. Silakan coba lagi."): string {
    if (!(error instanceof ApiError)) {
        return fallback
    }

    if (error.kind === "conflict" || error.kind === "validation") {
        return error.detail
    }

    return MESSAGES[error.kind] ?? fallback
}

export function applyServerFieldErrors(
    error: unknown,
    knownFields: readonly string[],
    fieldMap: Readonly<Record<string, string>> = {}
): Record<string, string> {
    if (!(error instanceof ApiError)) {
        return {}
    }

    const serverErrors = error.fieldErrors()
    const applied: Record<string, string> = {}

    for (const field of knownFields) {
        const message = serverErrors[field]

        if (message !== undefined) {
            applied[fieldMap[field] ?? field] = message
        }
    }

    return applied
}

export function firstServerFieldError(error: unknown): string | undefined {
    if (!(error instanceof ApiError)) {
        return undefined
    }

    return Object.values(error.fieldErrors()).find((message) => message !== undefined)
}
