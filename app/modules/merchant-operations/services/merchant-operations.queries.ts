import { keepPreviousData, useQuery } from "@tanstack/react-query"

import {
    fetchAvailability,
    fetchOperatingHours,
    fetchOperationalProfile,
    fetchOperationsSummary,
    fetchOutlet,
    fetchOutletEmployees,
    fetchOutlets,
    fetchServiceArea,
} from "./merchant-operations.api"
import { merchantOperationsKeys } from "./merchant-operations.keys"
import type { OperationalOutletListParams } from "../types/merchant-operations.types"

const AVAILABILITY_REFRESH_MS = 60_000

type QueryGate = { enabled?: boolean }

export function useOperationsSummary() {
    return useQuery({
        queryKey: merchantOperationsKeys.summary(),
        queryFn: fetchOperationsSummary,
    })
}

export function useOperationalProfile() {
    return useQuery({
        queryKey: merchantOperationsKeys.profile(),
        queryFn: fetchOperationalProfile,
    })
}

export function useOperationalOutlets(params: OperationalOutletListParams = {}, gate: QueryGate = {}) {
    return useQuery({
        queryKey: merchantOperationsKeys.outlets(params),
        queryFn: () => fetchOutlets(params),
        placeholderData: keepPreviousData,
        enabled: gate.enabled ?? true,
    })
}

export function useOperationalOutlet(outletId: string | undefined) {
    return useQuery({
        queryKey: merchantOperationsKeys.outlet(outletId ?? ""),
        queryFn: () => fetchOutlet(outletId as string),
        enabled: outletId !== undefined && outletId.length > 0,
    })
}

export function useOutletEmployees(outletId: string | undefined, gate: QueryGate = {}) {
    return useQuery({
        queryKey: merchantOperationsKeys.employees(outletId ?? ""),
        queryFn: () => fetchOutletEmployees(outletId as string),
        enabled: outletId !== undefined && outletId.length > 0 && (gate.enabled ?? true),
    })
}

export function useOperatingHours(outletId: string | undefined, gate: QueryGate = {}) {
    return useQuery({
        queryKey: merchantOperationsKeys.operatingHours(outletId ?? ""),
        queryFn: () => fetchOperatingHours(outletId as string),
        enabled: outletId !== undefined && outletId.length > 0 && (gate.enabled ?? true),
    })
}

export function useServiceArea(outletId: string | undefined, gate: QueryGate = {}) {
    return useQuery({
        queryKey: merchantOperationsKeys.serviceArea(outletId ?? ""),
        queryFn: () => fetchServiceArea(outletId as string),
        enabled: outletId !== undefined && outletId.length > 0 && (gate.enabled ?? true),
    })
}

export function useAvailability(outletId: string | undefined, gate: QueryGate = {}) {
    return useQuery({
        queryKey: merchantOperationsKeys.availability(outletId ?? ""),
        queryFn: () => fetchAvailability(outletId as string),
        enabled: outletId !== undefined && outletId.length > 0 && (gate.enabled ?? true),
        refetchInterval: AVAILABILITY_REFRESH_MS,
        refetchOnWindowFocus: true,
    })
}
