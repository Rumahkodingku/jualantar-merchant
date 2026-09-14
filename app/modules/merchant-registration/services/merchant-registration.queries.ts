import { queryOptions, useQuery } from "@tanstack/react-query"

import { fetchRegistration, fetchReview } from "./merchant-registration.api"
import { merchantRegistrationKeys } from "./merchant-registration.keys"

export function registrationQueryOptions() {
    return queryOptions({
        queryKey: merchantRegistrationKeys.detail(),
        queryFn: fetchRegistration,
    })
}

export function useRegistration() {
    return useQuery(registrationQueryOptions())
}

export function reviewQueryOptions() {
    return queryOptions({
        queryKey: merchantRegistrationKeys.review(),
        queryFn: fetchReview,
    })
}

export function useRegistrationReview(enabled = true) {
    return useQuery({ ...reviewQueryOptions(), enabled })
}
