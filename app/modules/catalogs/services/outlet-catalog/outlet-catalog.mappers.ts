import type {
    AvailabilityStatus,
    CatalogStatus,
    OutletCatalogAssignment,
    OutletCatalogCategory,
    OutletCatalogItem,
    OutletCatalogProduct,
    OutletCatalogVariant,
    ProductModifierGroup,
    ProductPrimaryMedia,
    ProductType,
} from "../../types"
import { normalizePrice, normalizeRequiredPrice } from "../../utils/normalize"
import { toModifierGroup, type ProductModifierGroupWire } from "../catalog.mappers"

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
    is_default: boolean
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
    modifier_groups: ProductModifierGroupWire[]
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

function toModifierGroups(wires: ProductModifierGroupWire[] | undefined): ProductModifierGroup[] {
    return (wires ?? []).map(toModifierGroup)
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
