import type { DayKey, GeographyLabel, OperatingHours } from "~/modules/merchant-registration"
import type { OutletUserRole } from "~/modules/auth"

// Re-exported so existing consumers keep a single import path; the definition
// lives in `auth` because it is part of the `/auth/me` session contract.
export type { OutletUserRole }

export type MerchantStatus = "inactive" | "active" | "suspended"

export type OutletStatus = "active" | "inactive"

export type OutletServiceAreaType = "radius" | "province" | "regency" | "district" | "village"

export type OperationalAvailabilityStatus = "open" | "closed"

export type AvailabilityReason =
    "merchant_inactive" | "merchant_suspended" | "outlet_inactive" | "outside_operating_hours" | "scheduled_closed"

export type OperationalUploadPurpose = "logo" | "outlet"

export type OperationsSummary = {
    merchant: {
        id: string
        business_name: string
        status: MerchantStatus
    }
    operational: {
        status: MerchantStatus
    }
}

export type OperationalProfile = {
    id: string
    business_name: string
    slug: string | null
    description: string | null
    logo: string | null
    logo_url: string | null
    operational_phone: string | null
    operational_email: string | null
    website: string | null
    status: MerchantStatus
    updated_at: string | null
}

export type OperationalProfileInput = {
    business_name?: string
    description?: string | null
    logo?: string | null
    operational_phone?: string | null
    operational_email?: string | null
    website?: string | null
}

export type OperationalStatusPayload = {
    id: string
    business_name: string
    slug: string | null
    status: MerchantStatus
    updated_at: string | null
}

export type OperationalOutlet = {
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
    latitude: number | string
    longitude: number | string
    service_area_type: OutletServiceAreaType
    service_radius_km: number | string | null
    operating_hours: OperatingHours | null
    photos: string[]
    photos_url: (string | null)[]
    status: OutletStatus
    geography: GeographyLabel | null
    created_at: string | null
    updated_at: string | null
}

export type OperationalOutletInput = {
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
    photos?: string[]
}

export type OperationalOutletListParams = {
    search?: string
    status?: OutletStatus
    page?: number
    per_page?: number
}

export type OutletEmployee = {
    user: {
        id: string
        email: string
        phone: string | null
    } | null
    role: OutletUserRole
    assigned_at: string | null
}

export type CreateOutletEmployeeInput = {
    email: string
    phone?: string | null
    password: string
    password_confirmation: string
    role: OutletUserRole
}

export type OperationalAvailability = {
    status: OperationalAvailabilityStatus
    reason: AvailabilityReason | null
    merchant_status: MerchantStatus
    outlet_status: OutletStatus
    schedule: {
        open: string
        close: string
    } | null
}

export type RadiusServiceArea = {
    type: "radius"
    radius_km: number | string | null
}

export type RegionServiceArea = {
    type: Exclude<OutletServiceAreaType, "radius">
    province_id?: number | null
    regency_id?: number | null
    district_id?: number | null
    village_id?: number | null
}

export type ServiceArea = RadiusServiceArea | RegionServiceArea

export type ServiceAreaInput =
    | { type: "radius"; radius_km: number }
    | { type: "province"; province_id: number }
    | { type: "regency"; regency_id: number }
    | { type: "district"; district_id: number }
    | { type: "village"; village_id: number }

export type OperationalUpload = {
    object_key: string
    upload_url: string
    headers: Record<string, string>
    expires_at: string
}

export type OperationalUploadInput = {
    purpose: OperationalUploadPurpose
    file_name: string
    mime_type: string
    file_size: number
}

/** Full seven-day payload expected by `PUT .../operating-hours`. */
export type OperatingHoursPayload = Record<DayKey, { is_open: boolean; open?: string; close?: string }>

export type Paginated<T> = {
    data: T[]
    meta: {
        current_page: number
        per_page: number
        total: number
        last_page: number
    }
}
