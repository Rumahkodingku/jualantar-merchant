import { api } from "~/lib/api"

import type { CatalogCategory, CatalogService } from "../types/service-catalog.types"

export async function fetchServices(): Promise<CatalogService[]> {
    const { data } = await api.get<{ data: CatalogService[] }>("/services")

    return data.data
}

export async function fetchCategories(serviceId: string): Promise<CatalogCategory[]> {
    const { data } = await api.get<{ data: CatalogCategory[] }>(`/services/${serviceId}/categories`)

    return data.data
}
