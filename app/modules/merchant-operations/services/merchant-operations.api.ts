import { api } from "~/lib/api"

import type {
    CreateOutletEmployeeInput,
    OperationalAvailability,
    OperationalOutlet,
    OperationalOutletInput,
    OperationalOutletListParams,
    OperationalProfile,
    OperationalProfileInput,
    OperationalStatusPayload,
    OperationalUpload,
    OperationalUploadInput,
    OperationsSummary,
    OutletEmployee,
    OutletUserRole,
    Paginated,
    OperatingHoursPayload,
    ServiceArea,
    ServiceAreaInput,
} from "../types/merchant-operations.types"
import type { OperatingHours } from "~/modules/merchant-registration"
import { normalizeOperatingHours } from "../utils/operating-hours"

const BASE = "/merchant/operations"

export async function fetchOperationsSummary(): Promise<OperationsSummary> {
    const { data } = await api.get<{ data: OperationsSummary }>(BASE)

    return data.data
}

export async function fetchOperationalProfile(): Promise<OperationalProfile> {
    const { data } = await api.get<{ data: OperationalProfile }>(`${BASE}/profile`)

    return data.data
}

export async function updateOperationalProfile(input: OperationalProfileInput): Promise<OperationalProfile> {
    const { data } = await api.patch<{ data: OperationalProfile }>(`${BASE}/profile`, input)

    return data.data
}

export async function activateMerchant(): Promise<OperationalStatusPayload> {
    const { data } = await api.post<{ data: OperationalStatusPayload }>(`${BASE}/activate`)

    return data.data
}

export async function suspendMerchant(): Promise<OperationalStatusPayload> {
    const { data } = await api.post<{ data: OperationalStatusPayload }>(`${BASE}/suspend`)

    return data.data
}

export async function reactivateMerchant(): Promise<OperationalStatusPayload> {
    const { data } = await api.post<{ data: OperationalStatusPayload }>(`${BASE}/reactivate`)

    return data.data
}

export async function createOperationalUpload(input: OperationalUploadInput): Promise<OperationalUpload> {
    const { data } = await api.post<{ data: OperationalUpload }>(`${BASE}/uploads`, input)

    return data.data
}

export async function fetchOutlets(params: OperationalOutletListParams = {}): Promise<Paginated<OperationalOutlet>> {
    const { data } = await api.get<Paginated<OperationalOutlet>>(`${BASE}/outlets`, { params })

    return data
}

export async function fetchOutlet(outletId: string): Promise<OperationalOutlet> {
    const { data } = await api.get<{ data: OperationalOutlet }>(`${BASE}/outlets/${outletId}`)

    return data.data
}

export async function createOutlet(input: OperationalOutletInput): Promise<OperationalOutlet> {
    const { data } = await api.post<{ data: OperationalOutlet }>(`${BASE}/outlets`, input)

    return data.data
}

export async function updateOutlet(
    outletId: string,
    input: Partial<OperationalOutletInput>
): Promise<OperationalOutlet> {
    const { data } = await api.patch<{ data: OperationalOutlet }>(`${BASE}/outlets/${outletId}`, input)

    return data.data
}

export async function activateOutlet(outletId: string): Promise<OperationalOutlet> {
    const { data } = await api.post<{ data: OperationalOutlet }>(`${BASE}/outlets/${outletId}/activate`)

    return data.data
}

export async function deactivateOutlet(outletId: string): Promise<OperationalOutlet> {
    const { data } = await api.post<{ data: OperationalOutlet }>(`${BASE}/outlets/${outletId}/deactivate`)

    return data.data
}

export async function fetchOutletEmployees(outletId: string): Promise<OutletEmployee[]> {
    const { data } = await api.get<{ data: OutletEmployee[] }>(`${BASE}/outlets/${outletId}/users`)

    return data.data
}

export async function createOutletEmployee(
    outletId: string,
    input: CreateOutletEmployeeInput
): Promise<OutletEmployee> {
    const { data } = await api.post<{ data: OutletEmployee }>(`${BASE}/outlets/${outletId}/employees`, input)

    return data.data
}

export async function changeOutletEmployeeRole(
    outletId: string,
    userId: string,
    role: OutletUserRole
): Promise<OutletEmployee> {
    const { data } = await api.patch<{ data: OutletEmployee }>(`${BASE}/outlets/${outletId}/users/${userId}`, { role })

    return data.data
}

export async function removeOutletEmployee(outletId: string, userId: string): Promise<void> {
    await api.delete(`${BASE}/outlets/${outletId}/users/${userId}`)
}

export async function fetchOperatingHours(outletId: string): Promise<OperatingHours> {
    const { data } = await api.get<{ data: unknown }>(`${BASE}/outlets/${outletId}/operating-hours`)

    return normalizeOperatingHours(data.data)
}

export async function updateOperatingHours(outletId: string, payload: OperatingHoursPayload): Promise<OperatingHours> {
    const { data } = await api.put<{ data: unknown }>(`${BASE}/outlets/${outletId}/operating-hours`, payload)

    return normalizeOperatingHours(data.data)
}

export async function fetchServiceArea(outletId: string): Promise<ServiceArea> {
    const { data } = await api.get<{ data: ServiceArea }>(`${BASE}/outlets/${outletId}/service-area`)

    return data.data
}

export async function updateServiceArea(outletId: string, input: ServiceAreaInput): Promise<ServiceArea> {
    const { data } = await api.put<{ data: ServiceArea }>(`${BASE}/outlets/${outletId}/service-area`, input)

    return data.data
}

export async function fetchAvailability(outletId: string): Promise<OperationalAvailability> {
    const { data } = await api.get<{ data: OperationalAvailability }>(`${BASE}/outlets/${outletId}/availability`)

    return data.data
}
