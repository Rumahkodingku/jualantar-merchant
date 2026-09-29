import type { CatalogStatus, SelectionType } from "./common.types"

/**
 * A row the wizard owns locally.
 *
 * `id` is the one field that tells the two flows apart. A create wizard stages
 * rows that do not exist yet, so `id` is always absent and every row becomes a
 * create. The edit wizard hydrates the same shape from the product it is
 * editing, so `id` is the server id of the row that is being changed: present
 * means patch, absent means create. Nothing else in the row shape has to know
 * which flow it is in.
 */
export interface VariantDraft {
    id?: string
    key: string
    name: string
    sku: string
    price: number
    status: CatalogStatus
    is_default: boolean
}

export interface ModifierDraft {
    id?: string
    key: string
    name: string
    description: string
    price: number
    is_default: boolean
    status: CatalogStatus
}

export interface GroupDraft {
    id?: string
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
    /**
     * Set when the photo already belongs to the product being edited. Such a row
     * has no `object_key` of its own — it is already registered — so the edit
     * flow updates it by id and only registers the rows that do not have one.
     */
    id?: string
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
