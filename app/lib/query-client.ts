import { QueryClient } from "@tanstack/react-query"

import { ApiError } from "~/lib/api"

export function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30_000,
                refetchOnWindowFocus: false,
                retry: (failureCount, error) => {
                    if (error instanceof ApiError) {
                        if (
                            error.status === 401 ||
                            error.status === 403 ||
                            error.status === 404 ||
                            error.isValidation
                        ) {
                            return false
                        }
                    }

                    return failureCount < 1
                },
            },
            mutations: {
                retry: false,
            },
        },
    })
}
