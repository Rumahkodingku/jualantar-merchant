import { api } from "~/lib/api"

import type {
    AttachDocumentInput,
    BusinessProfileInput,
    CreateUploadInput,
    IdentityInput,
    LegalEntityInput,
    MerchantDocument,
    MerchantRegistration,
    OutletInput,
    PayoutAccountInput,
    PresignedUpload,
    RegistrationStatusPayload,
} from "../types/merchant-registration.types"

const BASE = "/merchants/registration"

export async function fetchRegistration(): Promise<MerchantRegistration> {
    const { data } = await api.get<{ data: MerchantRegistration }>(BASE)

    return data.data
}

export async function createRegistration(): Promise<RegistrationStatusPayload> {
    const { data } = await api.post<{ data: RegistrationStatusPayload }>(BASE, {})

    return data.data
}

export async function updateBusinessProfile(input: BusinessProfileInput): Promise<MerchantRegistration> {
    const { data } = await api.patch<{ data: MerchantRegistration }>(BASE, input)

    return data.data
}

export async function saveIdentity(input: IdentityInput): Promise<MerchantRegistration> {
    const { data } = await api.put<{ data: MerchantRegistration }>(`${BASE}/identity`, input)

    return data.data
}

export async function saveLegalEntity(input: LegalEntityInput): Promise<MerchantRegistration> {
    const { data } = await api.put<{ data: MerchantRegistration }>(`${BASE}/legal-entity`, input)

    return data.data
}

export async function saveService(serviceId: string): Promise<MerchantRegistration> {
    const { data } = await api.put<{ data: MerchantRegistration }>(`${BASE}/service`, { service_id: serviceId })

    return data.data
}

export async function saveCategories(categoryIds: string[]): Promise<MerchantRegistration> {
    const { data } = await api.put<{ data: MerchantRegistration }>(`${BASE}/categories`, { category_ids: categoryIds })

    return data.data
}

export async function createOutlet(input: OutletInput): Promise<MerchantRegistration> {
    const { data } = await api.post<{ data: MerchantRegistration }>(`${BASE}/outlets`, input)

    return data.data
}

export async function updateOutlet(outletId: string, input: Partial<OutletInput>): Promise<MerchantRegistration> {
    const { data } = await api.patch<{ data: MerchantRegistration }>(`${BASE}/outlets/${outletId}`, input)

    return data.data
}

export async function deleteOutlet(outletId: string): Promise<void> {
    await api.delete(`${BASE}/outlets/${outletId}`)
}

export async function createRegistrationUpload(input: CreateUploadInput): Promise<PresignedUpload> {
    const { data } = await api.post<{ data: PresignedUpload }>(`${BASE}/uploads`, input)

    return data.data
}

export async function attachDocument(input: AttachDocumentInput): Promise<MerchantDocument> {
    const { data } = await api.post<{ data: MerchantDocument }>(`${BASE}/documents`, input)

    return data.data
}

export async function savePayoutAccount(input: PayoutAccountInput): Promise<MerchantRegistration> {
    const { data } = await api.put<{ data: MerchantRegistration }>(`${BASE}/payout-account`, input)

    return data.data
}

export async function fetchReview(): Promise<MerchantRegistration> {
    const { data } = await api.get<{ data: MerchantRegistration }>(`${BASE}/review`)

    return data.data
}

export async function submitRegistration(): Promise<RegistrationStatusPayload> {
    const { data } = await api.post<{ data: RegistrationStatusPayload }>(`${BASE}/submit`)

    return data.data
}

export async function reopenRegistration(): Promise<RegistrationStatusPayload> {
    const { data } = await api.post<{ data: RegistrationStatusPayload }>(`${BASE}/reopen`)

    return data.data
}
