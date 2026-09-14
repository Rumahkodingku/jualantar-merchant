import { queryOptions, useQuery } from "@tanstack/react-query"

import { fetchMe } from "./auth.api"
import { authKeys } from "./auth.keys"

export function meQueryOptions(enabled = true) {
    return queryOptions({
        queryKey: authKeys.me(),
        queryFn: fetchMe,
        enabled,
        staleTime: 5 * 60_000,
    })
}

export function useMe(enabled = true) {
    return useQuery(meQueryOptions(enabled))
}
