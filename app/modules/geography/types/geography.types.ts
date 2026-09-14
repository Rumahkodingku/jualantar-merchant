export type Province = {
    id: number
    code: string
    name: string
    is_active: boolean
}

export type Regency = {
    id: number
    province_id: number
    code: string
    name: string
    type: string | null
    is_active: boolean
}

export type District = {
    id: number
    regency_id: number
    code: string
    name: string
    is_active: boolean
}

export type Village = {
    id: number
    district_id: number
    code: string
    name: string
    type: string | null
    is_active: boolean
}

export type GeographySelection = {
    province_id: number | null
    regency_id: number | null
    district_id: number | null
    village_id: number | null
}
