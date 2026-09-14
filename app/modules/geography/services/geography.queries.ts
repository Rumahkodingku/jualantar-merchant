import { useQuery } from "@tanstack/react-query"

import { fetchDistricts, fetchProvinces, fetchRegencies, fetchVillages } from "./geography.api"
import { geographyKeys } from "./geography.keys"

const LONG_CACHE = 60 * 60_000

export function useProvinces(search?: string) {
    return useQuery({
        queryKey: geographyKeys.provinces(search),
        queryFn: () => fetchProvinces(search),
        staleTime: LONG_CACHE,
    })
}

export function useRegencies(provinceId: number | null | undefined, search?: string) {
    return useQuery({
        queryKey: geographyKeys.regencies(provinceId ?? 0, search),
        queryFn: () => fetchRegencies(provinceId as number, search),
        enabled: provinceId !== null && provinceId !== undefined,
        staleTime: LONG_CACHE,
    })
}

export function useDistricts(regencyId: number | null | undefined, search?: string) {
    return useQuery({
        queryKey: geographyKeys.districts(regencyId ?? 0, search),
        queryFn: () => fetchDistricts(regencyId as number, search),
        enabled: regencyId !== null && regencyId !== undefined,
        staleTime: LONG_CACHE,
    })
}

export function useVillages(districtId: number | null | undefined, search?: string) {
    return useQuery({
        queryKey: geographyKeys.villages(districtId ?? 0, search),
        queryFn: () => fetchVillages(districtId as number, search),
        enabled: districtId !== null && districtId !== undefined,
        staleTime: LONG_CACHE,
    })
}
