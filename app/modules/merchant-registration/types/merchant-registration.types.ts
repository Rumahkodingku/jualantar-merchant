export type MerchantStatus = "draft" | "pending" | "in_review" | "revision_required" | "approved" | "rejected"

export type MerchantOperationalStatus = "inactive" | "active" | "suspended"

export type MerchantType = "individual" | "company"

export type MerchantIdentityType = "ktp" | "sim" | "paspor"

export type LegalEntityType = "pt" | "cv" | "ud" | "koperasi" | "yayasan"

export type MerchantDocumentType =
    | "ktp"
    | "swafoto"
    | "npwp"
    | "nib"
    | "siup"
    | "izin_usaha"
    | "akta_pendirian"
    | "identitas_direktur"
    | "rekening"
    | "foto_outlet"
    | "lainnya"

export type OutletServiceAreaType = "radius" | "province" | "regency" | "district" | "village"

export type OutletStatus = "active" | "inactive"

export type UploadPurpose = "logo" | "document" | "outlet"

export type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"

export type GeographyLabel = {
    village: string | null
    district: string | null
    regency: string | null
    province: string | null
}

export type OperatingHourSlot = {
    open: string
    close: string
}

export type OperatingHours = Partial<Record<DayKey, OperatingHourSlot[]>>

export type MerchantServiceRef = {
    id: string
    name: string
    slug: string
}

export type MerchantIdentity = {
    id: string
    merchant_id: string
    id_type: MerchantIdentityType
    id_number: string
    full_name: string
    birth_date: string | null
    created_at: string | null
    updated_at: string | null
}

export type LegalEntity = {
    id: string
    entity_type: LegalEntityType
    name: string
    nib: string
    npwp: string
    address: string | null
    province_id: number
    regency_id: number
    district_id: number
    village_id: number
    postal_code: string | null
    geography: GeographyLabel | null
    created_at: string | null
    updated_at: string | null
}

export type MerchantCategory = {
    id: string
    category_id: string
    name: string | null
    slug: string | null
    created_at: string | null
    updated_at: string | null
}

export type MerchantOutlet = {
    id: string
    merchant_id: string
    name: string
    phone: string | null
    email: string | null
    address: string
    province_id: number
    regency_id: number
    district_id: number
    village_id: number
    postal_code: string
    latitude: number
    longitude: number
    service_area_type: OutletServiceAreaType
    service_radius_km: number | null
    operating_hours: OperatingHours | null
    photos: string[]
    photos_url: (string | null)[]
    status: OutletStatus
    geography: GeographyLabel | null
    created_at: string | null
    updated_at: string | null
}

export type MerchantDocument = {
    id: string
    merchant_id: string
    document_type: MerchantDocumentType
    file_name: string
    object_key: string
    mime_type: string
    file_size: number
    url: string | null
    created_at: string | null
    updated_at: string | null
}

export type PayoutAccount = {
    id: string
    bank_id: number
    bank_name: string
    account_number: string
    account_name: string
    is_primary: boolean
    status: string
    rejection_reason: string | null
}

export type MerchantRegistration = {
    id: string
    business_name: string | null
    slug: string | null
    description: string | null
    type: MerchantType | null
    /** Lifecycle state, derived from the current application. Drives the wizard. */
    status: MerchantStatus
    /** Operational merchant state owned by the backend. */
    merchant_status: MerchantOperationalStatus
    logo: string | null
    logo_url: string | null
    service: MerchantServiceRef | null
    identity: MerchantIdentity | null
    legal_entity: LegalEntity | null
    categories: MerchantCategory[]
    outlets: MerchantOutlet[]
    documents: MerchantDocument[]
    payout_accounts: PayoutAccount[]
    /** Derived from the latest approval revision's first unresolved item. */
    rejection_stage?: string | null
    /** Derived from the latest approval revision's note. */
    rejection_reason?: string | null
    /** Final rejection reason set by the admin when the application is rejected. */
    decision_reason?: string | null
    created_at: string | null
    updated_at: string | null
}

export type MerchantApplication = {
    id: string
    merchant_id: string
    application_number: string
    status: MerchantStatus
    submitted_at: string | null
    created_at: string | null
    updated_at: string | null
}

export type MerchantApprovalRevisionItem = {
    id: string
    revision_id: string
    component: string
    subject_type: string
    subject_id: string
    reason: string | null
    resolved_at: string | null
    created_at: string | null
}

export type MerchantApprovalRevision = {
    id: string
    approval_id: string
    requested_by: string | null
    note: string | null
    status: string
    requested_at: string | null
    resolved_at: string | null
    /** The merchant-facing overview does not include revision items. */
    items?: MerchantApprovalRevisionItem[] | undefined
    created_at: string | null
}

/** Raw merchant payload as returned by the API: `status` is operational. */
export type MerchantResource = Omit<
    MerchantRegistration,
    "status" | "merchant_status" | "rejection_stage" | "rejection_reason"
> & {
    status: MerchantOperationalStatus
}

export type RegistrationOverview = {
    merchant: MerchantResource
    application: MerchantApplication | null
    revisions: MerchantApprovalRevision[]
    decision_reason?: string | null
}

export type RegistrationStatusPayload = {
    merchant_id: string
    merchant_status: MerchantOperationalStatus
    application: MerchantApplication | null
}

export type PresignedUpload = {
    object_key: string
    upload_url: string
    headers: Record<string, string>
    expires_at: string
}

export type BusinessProfileInput = {
    business_name?: string | null
    type?: MerchantType | null
    description?: string | null
}

export type IdentityInput = {
    id_type: MerchantIdentityType
    id_number: string
    full_name: string
    birth_date?: string | null
}

export type LegalEntityInput = {
    entity_type: LegalEntityType
    name: string
    nib: string
    npwp: string
    address?: string | null
    province_id: number
    regency_id: number
    district_id: number
    village_id: number
    postal_code?: string | null
}

export type OutletInput = {
    name: string
    phone?: string | null
    email?: string | null
    address: string
    province_id: number
    regency_id: number
    district_id: number
    village_id: number
    postal_code: string
    latitude: number
    longitude: number
    service_area_type: OutletServiceAreaType
    service_radius_km?: number | null
    status?: OutletStatus
    operating_hours?: OperatingHours | null
    photos?: string[]
}

export type PayoutAccountInput = {
    bank_id: number
    account_number: string
    account_name: string
}

export type CreateUploadInput = {
    purpose: UploadPurpose
    file_name: string
    mime_type: string
    file_size: number
}

export type AttachDocumentInput = {
    document_type: MerchantDocumentType
    object_key: string
    file_name: string
    mime_type: string
    file_size: number
}
