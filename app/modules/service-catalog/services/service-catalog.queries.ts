import { queryOptions, useQuery } from "@tanstack/react-query"

import { fetchCategories, fetchServices } from "./service-catalog.api"
import { serviceCatalogKeys } from "./service-catalog.keys"

const TEN_MINUTES = 10 * 60_000

export function servicesQueryOptions() {
    return queryOptions({
        queryKey: serviceCatalogKeys.services(),
        queryFn: fetchServices,
        staleTime: TEN_MINUTES,
    })
}

export function categoriesQueryOptions(serviceId: string) {
    return queryOptions({
        queryKey: serviceCatalogKeys.categories(serviceId),
        queryFn: () => fetchCategories(serviceId),
        staleTime: TEN_MINUTES,
    })
}

export function useServices() {
    return useQuery(servicesQueryOptions())
}

export function useCategories(serviceId: string | null | undefined) {
    return useQuery({
        ...categoriesQueryOptions(serviceId ?? "none"),
        enabled: serviceId !== null && serviceId !== undefined && serviceId !== "",
    })
}
