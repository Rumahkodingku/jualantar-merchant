import { useEffect, useState } from "react"

import { ApiError } from "~/lib/api"
import { hasAuthToken } from "~/lib/auth-token"

import { useMe } from "../services/auth.queries"

export function useSession() {
    const [mounted, setMounted] = useState(false)
    const [hasToken, setHasToken] = useState(false)

    useEffect(() => {
        setHasToken(hasAuthToken())
        setMounted(true)
    }, [])

    const query = useMe(mounted && hasToken)

    const isUnauthorized = query.error instanceof ApiError && query.error.status === 401

    return {
        user: query.data ?? null,
        hasToken,
        isUnauthorized,
        isLoading: mounted && hasToken && query.isPending,
        isAuthenticated: hasToken && query.isSuccess,
        error: query.error,
    }
}
