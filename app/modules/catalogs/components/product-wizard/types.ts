import type { CatalogStatus, SelectionType } from "../../types/catalog.types"

export interface VariantDraft {
    key: string
    name: string
    sku: string
    price: number
    status: CatalogStatus
    is_default: boolean
}

export interface ModifierDraft {
    key: string
    name: string
    description: string
    price: number
    is_default: boolean
    status: CatalogStatus
}

export interface GroupDraft {
    key: string
    name: string
    description: string
    selection_type: SelectionType
    min_selection: number
    max_selection: number | null
    is_required: boolean
    status: CatalogStatus
    modifiers: ModifierDraft[]
}

/**
 * A photo staged in the wizard.
 *
 * The file is uploaded as soon as it is picked, so a draft holds the storage key
 * rather than the bytes: that is what makes a staged photo survive a reload.
 * `preview_url` is signed by the API per read, which is why it is not persisted
 * and why the list can briefly carry `null` for a tile that is still uploading.
 */
export interface MediaDraft {
    key: string
    object_key: string
    file_name: string
    mime_type: string
    file_size: number
    preview_url: string | null
    alt_text: string
    is_primary: boolean
    status: "uploading" | "ready" | "error"
}

export type GroupDraftPayload = Omit<GroupDraft, "key" | "status" | "modifiers">

export type ModifierDraftPayload = Omit<ModifierDraft, "key" | "status">
