import type { FieldValues, Path, UseFormSetError } from "react-hook-form"

import { ApiError } from "~/lib/api"

export function getApiErrorMessage(error: unknown, fallback = "Terjadi kesalahan. Silakan coba lagi."): string {
    if (error instanceof ApiError) {
        return error.detail
    }

    return fallback
}

export function applyApiFieldErrors<T extends FieldValues>(
    error: unknown,
    setError: UseFormSetError<T>,
    knownFields: readonly string[]
): boolean {
    if (!(error instanceof ApiError)) {
        return false
    }

    const fieldErrors = error.fieldErrors()
    let applied = false

    for (const [field, message] of Object.entries(fieldErrors)) {
        if (knownFields.includes(field)) {
            setError(field as Path<T>, { type: "server", message })
            applied = true
        }
    }

    return applied
}
