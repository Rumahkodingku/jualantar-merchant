const STORAGE_KEY = "jualantar.merchant.auth-token"

type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | null = null

export function getAuthToken(): string | null {
    if (typeof window === "undefined") {
        return null
    }

    return window.localStorage.getItem(STORAGE_KEY)
}

export function setAuthToken(token: string): void {
    if (typeof window === "undefined") {
        return
    }

    window.localStorage.setItem(STORAGE_KEY, token)
}

export function clearAuthToken(): void {
    if (typeof window === "undefined") {
        return
    }

    window.localStorage.removeItem(STORAGE_KEY)
}

export function hasAuthToken(): boolean {
    return getAuthToken() !== null
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
    unauthorizedHandler = handler
}

export function notifyUnauthorized(): void {
    unauthorizedHandler?.()
}
