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

export interface MediaDraft {
    key: string
    file: File
    previewUrl: string
    alt_text: string
    is_primary: boolean
}

export type GroupDraftPayload = Omit<GroupDraft, "key" | "status" | "modifiers">

export type ModifierDraftPayload = Omit<ModifierDraft, "key" | "status">
