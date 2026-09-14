import { api } from "~/lib/api"

import type { District, Province, Regency, Village } from "../types/geography.types"

type Paginated<T> = { data: T[] }

async function getList<T>(url: string, params: Record<string, string | number | undefined>): Promise<T[]> {
    const { data } = await api.get<Paginated<T>>(url, { params })

    return data.data
}

export function fetchProvinces(search?: string): Promise<Province[]> {
    return getList<Province>("/provinces", { search, per_page: 100 })
}

export function fetchRegencies(provinceId: number, search?: string): Promise<Regency[]> {
    return getList<Regency>("/regencies", {
        province_id: provinceId,
        search,
        per_page: 100,
    })
}

export function fetchDistricts(regencyId: number, search?: string): Promise<District[]> {
    return getList<District>("/districts", {
        regency_id: regencyId,
        search,
        per_page: 100,
    })
}

export function fetchVillages(districtId: number, search?: string): Promise<Village[]> {
    return getList<Village>("/villages", {
        district_id: districtId,
        search,
        per_page: 100,
    })
}
