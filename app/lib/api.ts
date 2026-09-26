import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios"

import { clearAuthToken, getAuthToken, notifyUnauthorized } from "~/lib/auth-token"

export type ProblemDetails = {
    type?: string
    title?: string
    status?: number
    detail?: string
    instance?: string
    code?: string
    trace_id?: string
    errors?: Record<string, string[]>
    [key: string]: unknown
}

export type ApiErrorKind =
    | "validation"
    | "unauthenticated"
    | "forbidden"
    | "not_found"
    | "conflict"
    | "rate_limited"
    | "network"
    | "server"
    | "unknown"

export class ApiError extends Error {
    readonly status: number
    readonly code: string
    readonly title: string
    readonly detail: string
    readonly errors: Record<string, string[]>
    readonly traceId?: string
    readonly context: Record<string, unknown>

    constructor(problem: {
        status: number
        code: string
        title: string
        detail: string
        errors?: Record<string, string[]>
        traceId?: string
        context?: Record<string, unknown>
    }) {
        super(problem.detail)
        this.name = "ApiError"
        this.status = problem.status
        this.code = problem.code
        this.title = problem.title
        this.detail = problem.detail
        this.errors = problem.errors ?? {}
        this.traceId = problem.traceId
        this.context = problem.context ?? {}
    }

    get kind(): ApiErrorKind {
        if (this.code === "network_error") {
            return "network"
        }

        switch (this.status) {
            case 401:
                return "unauthenticated"
            case 403:
                return "forbidden"
            case 404:
                return "not_found"
            case 409:
                return "conflict"
            case 422:
                return "validation"
            case 429:
                return "rate_limited"
            default:
                return this.status >= 500 ? "server" : "unknown"
        }
    }

    get isValidation(): boolean {
        return this.kind === "validation"
    }

    get isNetwork(): boolean {
        return this.kind === "network"
    }

    get isUnauthenticated(): boolean {
        return this.kind === "unauthenticated"
    }

    get isForbidden(): boolean {
        return this.kind === "forbidden"
    }

    get isNotFound(): boolean {
        return this.kind === "not_found"
    }

    /** Map RFC 9457 `errors` onto a flat `field -> message` record. */
    fieldErrors(): Record<string, string> {
        const mapped: Record<string, string> = {}

        for (const [field, messages] of Object.entries(this.errors)) {
            if (messages.length > 0) {
                mapped[field] = messages[0]
            }
        }

        return mapped
    }
}

const baseURL = import.meta.env.VITE_API_URL ?? "/api/v1"

export const api: AxiosInstance = axios.create({
    baseURL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
})

api.interceptors.request.use((config) => {
    const token = getAuthToken()

    if (token !== null) {
        config.headers.set("Authorization", `Bearer ${token}`)
    }

    return config
})

api.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
        const normalized = normalizeApiError(error)

        if (normalized.status === 401 && normalized.code !== "invalid_credentials" && getAuthToken() !== null) {
            clearAuthToken()
            notifyUnauthorized()
        }

        return Promise.reject(normalized)
    }
)

export function normalizeApiError(error: unknown): ApiError {
    if (error instanceof ApiError) {
        return error
    }

    if (error instanceof AxiosError) {
        const problem = error.response?.data as ProblemDetails | undefined

        if (problem !== undefined && typeof problem === "object") {
            const context =
                typeof problem.context === "object" && problem.context !== null
                    ? (problem.context as Record<string, unknown>)
                    : undefined

            return new ApiError({
                status: problem.status ?? error.response?.status ?? 500,
                code: problem.code ?? "unknown_error",
                title: problem.title ?? error.response?.statusText ?? "Error",
                detail: problem.detail ?? problem.title ?? "Terjadi kesalahan.",
                errors: problem.errors,
                traceId: problem.trace_id,
                context,
            })
        }

        if (error.response === undefined) {
            return new ApiError({
                status: 0,
                code: "network_error",
                title: "Tidak dapat terhubung",
                detail: "Periksa koneksi internet Anda lalu coba lagi. Perubahan belum tersimpan.",
            })
        }

        return new ApiError({
            status: error.response.status,
            code: "unknown_error",
            title: error.response.statusText || "Error",
            detail: "Terjadi kesalahan. Silakan coba lagi.",
        })
    }

    return new ApiError({
        status: 0,
        code: "unknown_error",
        title: "Error",
        detail: "Terjadi kesalahan yang tidak diketahui.",
    })
}

/** Upload a binary straight to object storage (bypasses the API host). */
export async function putToStorage(
    uploadUrl: string,
    file: Blob,
    options: {
        headers?: Record<string, string>
        onProgress?: (percentage: number) => void
        signal?: AbortSignal
    } = {}
): Promise<void> {
    const config: AxiosRequestConfig = {
        headers: options.headers,
        signal: options.signal,
        onUploadProgress: (event) => {
            if (options.onProgress !== undefined && event.total) {
                options.onProgress(Math.round((event.loaded / event.total) * 100))
            }
        },
    }

    await axios.put(uploadUrl, file, config)
}
