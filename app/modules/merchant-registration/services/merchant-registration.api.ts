import { api } from "~/lib/api"

import { normalizeRegistrationOverview } from "../utils/normalize-registration"
import type {
    AttachDocumentInput,
    BusinessProfileInput,
    CreateUploadInput,
    IdentityInput,
    LegalEntityInput,
    MerchantDocument,
    MerchantRegistration,
    MerchantResource,
    OutletInput,
    PayoutAccountInput,
    PresignedUpload,
    RegistrationOverview,
    RegistrationStatusPayload,
} from "../types/merchant-registration.types"

const BASE = "/merchants/registration"

export async function fetchRegistration(): Promise<MerchantRegistration> {
    const { data } = await api.get<{ data: RegistrationOverview }>(BASE)

    return normalizeRegistrationOverview(data.data)
}

export async function createRegistration(): Promise<RegistrationStatusPayload> {
    const { data } = await api.post<{ data: RegistrationStatusPayload }>(BASE, {})

    return data.data
}

export async function updateBusinessProfile(input: BusinessProfileInput): Promise<MerchantResource> {
    const { data } = await api.patch<{ data: MerchantResource }>(BASE, input)

    return data.data
}

export async function saveIdentity(input: IdentityInput): Promise<MerchantResource> {
    const { data } = await api.put<{ data: MerchantResource }>(`${BASE}/identity`, input)

    return data.data
}

export async function saveLegalEntity(input: LegalEntityInput): Promise<MerchantResource> {
    const { data } = await api.put<{ data: MerchantResource }>(`${BASE}/legal-entity`, input)

    return data.data
}

export async function saveService(serviceId: string): Promise<MerchantResource> {
    const { data } = await api.put<{ data: MerchantResource }>(`${BASE}/service`, { service_id: serviceId })

    return data.data
}

export async function saveCategories(categoryIds: string[]): Promise<MerchantResource> {
    const { data } = await api.put<{ data: MerchantResource }>(`${BASE}/categories`, { category_ids: categoryIds })

    return data.data
}

export async function createOutlet(input: OutletInput): Promise<MerchantResource> {
    const { data } = await api.post<{ data: MerchantResource }>(`${BASE}/outlets`, input)

    return data.data
}

export async function updateOutlet(outletId: string, input: Partial<OutletInput>): Promise<MerchantResource> {
    const { data } = await api.patch<{ data: MerchantResource }>(`${BASE}/outlets/${outletId}`, input)

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

export async function deleteDocument(documentId: string): Promise<void> {
    await api.delete(`${BASE}/documents/${documentId}`)
}

export async function savePayoutAccount(input: PayoutAccountInput): Promise<MerchantResource> {
    const { data } = await api.put<{ data: MerchantResource }>(`${BASE}/payout-account`, input)

    return data.data
}

export async function fetchReview(): Promise<MerchantRegistration> {
    const { data } = await api.get<{ data: RegistrationOverview }>(`${BASE}/review`)

    return normalizeRegistrationOverview(data.data)
}

export async function submitRegistration(): Promise<RegistrationStatusPayload> {
    const { data } = await api.post<{ data: RegistrationStatusPayload }>(`${BASE}/submit`)

    return data.data
}
