import type {
    AvailabilityStatus,
    CatalogStatus,
    OutletCatalogAssignment,
    OutletCatalogCategory,
    OutletCatalogItem,
    OutletCatalogProduct,
    OutletCatalogVariant,
    OutletModifier,
    OutletModifierGroup,
    ProductPrimaryMedia,
    ProductType,
} from "../../types"
import { normalizePrice, normalizeRequiredPrice } from "../../utils/normalize"
import type { ProductModifierGroupWire, ProductModifierWire } from "../catalog.mappers"

/**
 * Wire shapes mirroring `OutletCatalogItemResource`. Prices arrive as strings
 * (or null), and `assignment`/`variants` are intentionally narrower than the
 * master catalog resources, so they are mapped here instead of through
 * `toProduct` / `toProductDetail`.
 */

export interface OutletCatalogProductWire {
    id: string
    name: string
    description: string | null
    product_type: ProductType
    price: string | null
    status: CatalogStatus
}

export interface OutletCatalogCategoryWire {
    id: string
    name: string
    status: CatalogStatus
}

export interface OutletCatalogVariantWire {
    id: string
    name: string
    sku: string | null
    price: string
    status: CatalogStatus
    effective_status: CatalogStatus
    is_overridden: boolean
    is_default: boolean
}

/**
 * The outlet projection reuses the master customization resource shape and adds
 * the two effective-status fields, so its wire type extends the master one.
 */
export type OutletModifierWire = ProductModifierWire & {
    effective_status: CatalogStatus
    is_overridden: boolean
}

export type OutletModifierGroupWire = ProductModifierGroupWire & {
    effective_status: CatalogStatus
    is_overridden: boolean
    modifiers?: OutletModifierWire[]
}

export interface OutletCatalogAssignmentWire {
    id: string
    status: CatalogStatus
    availability_status: AvailabilityStatus
    unavailable_reason: string | null
    display_order: number
}

export interface OutletCatalogItemWire {
    product: OutletCatalogProductWire
    category: OutletCatalogCategoryWire | null
    variants: OutletCatalogVariantWire[]
    primary_media: ProductPrimaryMedia | null
    modifier_groups: OutletModifierGroupWire[]
    assignment: OutletCatalogAssignmentWire | null
    is_sellable: boolean
}

function toOutletCatalogProduct(wire: OutletCatalogProductWire): OutletCatalogProduct {
    return { ...wire, price: normalizePrice(wire.price) }
}

function toOutletCatalogCategory(wire: OutletCatalogCategoryWire | null): OutletCatalogCategory | null {
    return wire === null ? null : { id: wire.id, name: wire.name, status: wire.status }
}

function toOutletCatalogVariant(wire: OutletCatalogVariantWire): OutletCatalogVariant {
    return { ...wire, price: normalizeRequiredPrice(wire.price) }
}

function toOutletCatalogAssignment(wire: OutletCatalogAssignmentWire | null): OutletCatalogAssignment | null {
    return wire === null
        ? null
        : {
              id: wire.id,
              status: wire.status,
              availability_status: wire.availability_status,
              unavailable_reason: wire.unavailable_reason,
              display_order: wire.display_order,
          }
}

function toOutletModifier(wire: OutletModifierWire): OutletModifier {
    return {
        id: wire.id,
        name: wire.name,
        description: wire.description,
        price: normalizeRequiredPrice(wire.price),
        is_default: wire.is_default,
        status: wire.status,
        effective_status: wire.effective_status,
        is_overridden: wire.is_overridden,
        display_order: wire.display_order,
        created_at: wire.created_at,
        updated_at: wire.updated_at,
    }
}

function toOutletModifierGroup(wire: OutletModifierGroupWire): OutletModifierGroup {
    return {
        id: wire.id,
        name: wire.name,
        description: wire.description,
        selection_type: wire.selection_type,
        min_selection: wire.min_selection,
        max_selection: wire.max_selection,
        is_required: wire.is_required,
        status: wire.status,
        effective_status: wire.effective_status,
        is_overridden: wire.is_overridden,
        display_order: wire.display_order,
        created_at: wire.created_at,
        updated_at: wire.updated_at,
        modifiers: (wire.modifiers ?? []).map(toOutletModifier),
    }
}

function toModifierGroups(wires: OutletModifierGroupWire[] | undefined): OutletModifierGroup[] {
    return (wires ?? []).map(toOutletModifierGroup)
}

export function toOutletCatalogItem(wire: OutletCatalogItemWire): OutletCatalogItem {
    return {
        product: toOutletCatalogProduct(wire.product),
        category: toOutletCatalogCategory(wire.category),
        variants: (wire.variants ?? []).map(toOutletCatalogVariant),
        primary_media: wire.primary_media ?? null,
        modifier_groups: toModifierGroups(wire.modifier_groups),
        assignment: toOutletCatalogAssignment(wire.assignment),
        is_sellable: wire.is_sellable,
    }
}
