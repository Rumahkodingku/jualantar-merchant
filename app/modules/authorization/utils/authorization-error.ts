import { ApiError } from "~/lib/api"
import { getApiErrorMessage } from "~/lib/api-form"

/**
 * Message for a failed query/mutation, distinguishing an authorization failure
 * (403) from other errors. A 403 must never be treated as a generic error: the
 * user's session stays intact and we tell them it is a permission problem.
 */
export function authorizationErrorMessage(error: unknown, fallback = "Terjadi kesalahan. Silakan coba lagi."): string {
    if (error instanceof ApiError) {
        if (error.status === 403) {
            return "Anda tidak memiliki izin untuk tindakan ini."
        }

        if (error.status === 404) {
            return "Data tidak ditemukan."
        }
    }

    return getApiErrorMessage(error, fallback)
}
