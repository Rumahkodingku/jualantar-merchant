import {
    dummyAssignmentsByProduct,
    dummyCategories,
    dummyMediaByProduct,
    dummyModifierGroupsByProduct,
    dummyOutlets,
    dummyProducts,
    dummyVariantsByProduct,
} from "../data"
import type {
    CatalogCategory,
    CatalogOutlet,
    OutletProductAssignment,
    Product,
    ProductMedia,
    ProductModifierGroup,
    ProductVariant,
} from "../types/catalog.types"

let idSequence = 1000

export function nextId(prefix: string): string {
    idSequence += 1

    return `${prefix}-${idSequence}`
}

export function nowIso(): string {
    return new Date().toISOString()
}

/**
 * In-memory tables seeded from dummy data. Reset on every page refresh —
 * intentional for the UI-only phase (no persistence required).
 */
export interface CatalogMockDb {
    products: Product[]
    categories: CatalogCategory[]
    variantsByProduct: Record<string, ProductVariant[]>
    mediaByProduct: Record<string, ProductMedia[]>
    modifierGroupsByProduct: Record<string, ProductModifierGroup[]>
    assignmentsByProduct: Record<string, OutletProductAssignment[]>
    outlets: CatalogOutlet[]
}

function clone<T>(value: T): T {
    return structuredClone(value)
}

function seed(): CatalogMockDb {
    return {
        products: clone(dummyProducts),
        categories: clone(dummyCategories),
        variantsByProduct: clone(dummyVariantsByProduct),
        mediaByProduct: clone(dummyMediaByProduct),
        modifierGroupsByProduct: clone(dummyModifierGroupsByProduct),
        assignmentsByProduct: clone(dummyAssignmentsByProduct),
        outlets: clone(dummyOutlets),
    }
}

const db: CatalogMockDb = seed()

export function getDb(): CatalogMockDb {
    return db
}

export function resetDb(): void {
    const fresh = seed()

    db.products = fresh.products
    db.categories = fresh.categories
    db.variantsByProduct = fresh.variantsByProduct
    db.mediaByProduct = fresh.mediaByProduct
    db.modifierGroupsByProduct = fresh.modifierGroupsByProduct
    db.assignmentsByProduct = fresh.assignmentsByProduct
    db.outlets = fresh.outlets
}
