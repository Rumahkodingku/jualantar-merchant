import type { CatalogStatus, SelectionType } from "./common.types"
import type { OutletItemOverride } from "./outlet-override.types"

export interface ProductModifier {
    id: string
    name: string
    description: string | null
    price: number
    is_default: boolean
    status: CatalogStatus
    display_order: number
    created_at: string | null
    updated_at: string | null
    /** Present only on the master product detail, never on the list endpoints. */
    outlet_overrides?: OutletItemOverride[]
}

export interface ProductModifierGroup {
    id: string
    name: string
    description: string | null
    selection_type: SelectionType
    min_selection: number
    max_selection: number | null
    is_required: boolean
    status: CatalogStatus
    display_order: number
    created_at: string | null
    updated_at: string | null
    /** Present only on the master product detail, never on the list endpoints. */
    outlet_overrides?: OutletItemOverride[]
    modifiers: ProductModifier[]
}

export interface ModifierGroupCreateInput {
    name: string
    description?: string | null
    selection_type: SelectionType
    min_selection: number
    max_selection?: number | null
    is_required: boolean
}

export interface ModifierGroupUpdateInput {
    name?: string
    description?: string | null
    selection_type?: SelectionType
    min_selection?: number
    max_selection?: number | null
    is_required?: boolean
}

export interface ModifierCreateInput {
    name: string
    description?: string | null
    price: number
    is_default?: boolean
}

export interface ModifierUpdateInput {
    name?: string
    description?: string | null
    price?: number
    is_default?: boolean
}
