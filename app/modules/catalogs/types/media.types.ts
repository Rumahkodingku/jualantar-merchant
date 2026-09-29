import type { SortOrder } from "./common.types"

export interface ProductMedia {
    id: string
    url: string | null
    alt_text: string | null
    mime_type: string
    file_size: number | null
    is_primary: boolean
    display_order: number
    created_at: string | null
    updated_at: string | null
}

export interface MediaIndexParams {
    sort?: "display_order" | "created_at"
    order?: SortOrder
    per_page?: number
    page?: number
}

export interface MediaUploadUrlInput {
    file_name: string
    mime_type: string
    file_size: number
}

export interface MediaUploadTarget {
    object_key: string
    upload_url: string
    headers: Record<string, string>
    expires_at: string
}

export interface MediaRegisterInput {
    object_key: string
    is_primary?: boolean
    alt_text?: string | null
    display_order?: number
}
