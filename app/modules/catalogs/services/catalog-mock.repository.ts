import { mediaPlaceholderPool } from "../data"
import type {
    AvailabilityStatus,
    CatalogCategory,
    CatalogStatus,
    CategoryCreateInput,
    CategoryIndexParams,
    CategoryUpdateInput,
    MediaCreateInput,
    ModifierCreateInput,
    ModifierGroupCreateInput,
    ModifierGroupUpdateInput,
    ModifierUpdateInput,
    OutletProductAssignment,
    PaginatedResponse,
    Product,
    ProductCreateInput,
    ProductDetail,
    ProductIndexParams,
    ProductMedia,
    ProductModifier,
    ProductModifierGroup,
    ProductUpdateInput,
    ProductVariant,
    ReorderItem,
    VariantCreateInput,
    VariantUpdateInput,
} from "../types/catalog.types"
import { getDb, nextId, nowIso } from "./catalog-mock-db"

const DEFAULT_PER_PAGE = 15

function paginate<T>(items: T[], page = 1, perPage = DEFAULT_PER_PAGE): PaginatedResponse<T> {
    const total = items.length
    const lastPage = Math.max(1, Math.ceil(total / perPage))
    const currentPage = Math.min(Math.max(1, page), lastPage)
    const start = (currentPage - 1) * perPage

    return {
        data: items.slice(start, start + perPage),
        meta: {
            current_page: currentPage,
            per_page: perPage,
            total,
            last_page: lastPage,
        },
    }
}

function applyOrder<T>(items: T[], order: string | undefined, accessor: (item: T) => string | number): T[] {
    const direction = order === "desc" ? -1 : 1

    return [...items].sort((a, b) => {
        const left = accessor(a)
        const right = accessor(b)

        if (typeof left === "number" && typeof right === "number") {
            return (left - right) * direction
        }

        return String(left).localeCompare(String(right), "id") * direction
    })
}

function findProductOrThrow(id: string): Product {
    const product = getDb().products.find((item) => item.id === id)

    if (product === undefined) {
        throw new Error(`Product ${id} not found`)
    }

    return product
}

function findCategoryOrThrow(id: string): CatalogCategory {
    const category = getDb().categories.find((item) => item.id === id)

    if (category === undefined) {
        throw new Error(`Category ${id} not found`)
    }

    return category
}

function resequence(items: { display_order: number }[]): void {
    items.forEach((item, index) => {
        item.display_order = index
    })
}

export function buildProductDetail(product: Product): ProductDetail {
    const db = getDb()

    return {
        ...product,
        category: db.categories.find((category) => category.id === product.category_id),
        variants: db.variantsByProduct[product.id] ?? [],
        media: db.mediaByProduct[product.id] ?? [],
        modifier_groups: db.modifierGroupsByProduct[product.id] ?? [],
    }
}

async function listProducts(params: ProductIndexParams = {}): Promise<PaginatedResponse<Product>> {
    const db = getDb()
    const search = params.search?.trim().toLowerCase()

    let items = db.products.filter((product) => {
        if (search !== undefined && search.length > 0 && !product.name.toLowerCase().includes(search)) {
            return false
        }

        if (
            params.category_id !== undefined &&
            params.category_id.length > 0 &&
            product.category_id !== params.category_id
        ) {
            return false
        }

        if (params.status !== undefined && product.status !== params.status) {
            return false
        }

        if (params.product_type !== undefined && product.product_type !== params.product_type) {
            return false
        }

        return true
    })

    items = applyOrder(items, params.order, (product) =>
        params.sort === "name"
            ? product.name
            : params.sort === "created_at"
              ? (product.created_at ?? "")
              : product.display_order
    )

    return paginate(items, params.page, params.per_page)
}

async function getProduct(id: string): Promise<ProductDetail> {
    return buildProductDetail(findProductOrThrow(id))
}

async function createProduct(input: ProductCreateInput): Promise<Product> {
    const db = getDb()
    const timestamp = nowIso()
    const product: Product = {
        id: nextId("prd"),
        category_id: input.category_id,
        name: input.name,
        description: input.description ?? null,
        product_type: input.product_type,
        price: input.price ?? null,
        status: "active",
        display_order: db.products.length,
        created_at: timestamp,
        updated_at: timestamp,
    }

    db.products.push(product)

    return product
}

async function updateProduct(id: string, input: ProductUpdateInput): Promise<Product> {
    const product = findProductOrThrow(id)

    if (input.category_id !== undefined) product.category_id = input.category_id
    if (input.name !== undefined) product.name = input.name
    if (input.description !== undefined) product.description = input.description
    if (input.product_type !== undefined) product.product_type = input.product_type
    if (input.price !== undefined) product.price = input.price
    product.updated_at = nowIso()

    return product
}

async function deleteProduct(id: string): Promise<void> {
    const db = getDb()

    findProductOrThrow(id)

    db.products = db.products.filter((product) => product.id !== id)
    delete db.variantsByProduct[id]
    delete db.mediaByProduct[id]
    delete db.modifierGroupsByProduct[id]
    delete db.assignmentsByProduct[id]
}

async function setProductStatus(id: string, status: CatalogStatus): Promise<Product> {
    const product = findProductOrThrow(id)

    product.status = status
    product.updated_at = nowIso()

    return product
}

async function reorderProducts(items: ReorderItem[]): Promise<void> {
    const db = getDb()

    for (const item of items) {
        const product = db.products.find((entry) => entry.id === item.id)

        if (product !== undefined) {
            product.display_order = item.display_order
            product.updated_at = nowIso()
        }
    }

    db.products.sort((a, b) => a.display_order - b.display_order)
    resequence(db.products)
}

async function listCategories(params: CategoryIndexParams = {}): Promise<PaginatedResponse<CatalogCategory>> {
    const db = getDb()
    const search = params.search?.trim().toLowerCase()

    let items = db.categories.filter((category) => {
        if (search !== undefined && search.length > 0 && !category.name.toLowerCase().includes(search)) {
            return false
        }

        if (params.status !== undefined && category.status !== params.status) {
            return false
        }

        return true
    })

    items = applyOrder(items, params.order, (category) =>
        params.sort === "name"
            ? category.name
            : params.sort === "created_at"
              ? (category.created_at ?? "")
              : category.display_order
    )

    return paginate(items, params.page, params.per_page)
}

async function getCategory(id: string): Promise<CatalogCategory> {
    return findCategoryOrThrow(id)
}

async function createCategory(input: CategoryCreateInput): Promise<CatalogCategory> {
    const db = getDb()
    const timestamp = nowIso()
    const category: CatalogCategory = {
        id: nextId("cat"),
        name: input.name,
        description: input.description ?? null,
        status: "active",
        display_order: db.categories.length,
        created_at: timestamp,
        updated_at: timestamp,
    }

    db.categories.push(category)

    return category
}

async function updateCategory(id: string, input: CategoryUpdateInput): Promise<CatalogCategory> {
    const category = findCategoryOrThrow(id)

    if (input.name !== undefined) category.name = input.name
    if (input.description !== undefined) category.description = input.description
    category.updated_at = nowIso()

    return category
}

async function deleteCategory(id: string): Promise<void> {
    const db = getDb()

    findCategoryOrThrow(id)

    db.categories = db.categories.filter((category) => category.id !== id)
}

async function setCategoryStatus(id: string, status: CatalogStatus): Promise<CatalogCategory> {
    const category = findCategoryOrThrow(id)

    category.status = status
    category.updated_at = nowIso()

    return category
}

async function reorderCategories(items: ReorderItem[]): Promise<void> {
    const db = getDb()

    for (const item of items) {
        const category = db.categories.find((entry) => entry.id === item.id)

        if (category !== undefined) {
            category.display_order = item.display_order
            category.updated_at = nowIso()
        }
    }

    db.categories.sort((a, b) => a.display_order - b.display_order)
    resequence(db.categories)
}

function ensureVariants(productId: string): ProductVariant[] {
    const db = getDb()

    findProductOrThrow(productId)

    if (db.variantsByProduct[productId] === undefined) {
        db.variantsByProduct[productId] = []
    }

    return db.variantsByProduct[productId]
}

async function listVariants(productId: string): Promise<ProductVariant[]> {
    return [...(getDb().variantsByProduct[productId] ?? [])]
}

async function createVariant(productId: string, input: VariantCreateInput): Promise<ProductVariant> {
    const variants = ensureVariants(productId)
    const timestamp = nowIso()
    const variant: ProductVariant = {
        id: nextId("var"),
        name: input.name,
        sku: input.sku ?? null,
        price: input.price,
        status: "active",
        is_default: input.is_default ?? variants.length === 0,
        display_order: variants.length,
        created_at: timestamp,
        updated_at: timestamp,
    }

    variants.push(variant)

    return variant
}

async function updateVariant(productId: string, variantId: string, input: VariantUpdateInput): Promise<ProductVariant> {
    const variants = ensureVariants(productId)
    const variant = variants.find((entry) => entry.id === variantId)

    if (variant === undefined) {
        throw new Error(`Variant ${variantId} not found`)
    }

    if (input.name !== undefined) variant.name = input.name
    if (input.sku !== undefined) variant.sku = input.sku
    if (input.price !== undefined) variant.price = input.price
    if (input.is_default !== undefined) variant.is_default = input.is_default
    variant.updated_at = nowIso()

    return variant
}

async function deleteVariant(productId: string, variantId: string): Promise<void> {
    const variants = ensureVariants(productId)
    const next = variants.filter((entry) => entry.id !== variantId)

    if (next.length === variants.length) {
        throw new Error(`Variant ${variantId} not found`)
    }

    getDb().variantsByProduct[productId] = next
    resequence(next)
}

async function setVariantStatus(productId: string, variantId: string, status: CatalogStatus): Promise<ProductVariant> {
    const variant = ensureVariants(productId).find((entry) => entry.id === variantId)

    if (variant === undefined) {
        throw new Error(`Variant ${variantId} not found`)
    }

    variant.status = status
    variant.updated_at = nowIso()

    return variant
}

async function reorderVariants(productId: string, items: ReorderItem[]): Promise<void> {
    const variants = ensureVariants(productId)

    for (const item of items) {
        const variant = variants.find((entry) => entry.id === item.id)

        if (variant !== undefined) {
            variant.display_order = item.display_order
            variant.updated_at = nowIso()
        }
    }

    variants.sort((a, b) => a.display_order - b.display_order)
    resequence(variants)
}

function ensureMedia(productId: string): ProductMedia[] {
    const db = getDb()

    findProductOrThrow(productId)

    if (db.mediaByProduct[productId] === undefined) {
        db.mediaByProduct[productId] = []
    }

    return db.mediaByProduct[productId]
}

async function listMedia(productId: string): Promise<ProductMedia[]> {
    return [...(getDb().mediaByProduct[productId] ?? [])]
}

async function createMedia(productId: string, input: MediaCreateInput): Promise<ProductMedia> {
    const media = ensureMedia(productId)
    const timestamp = nowIso()
    const shouldBePrimary = input.is_primary ?? media.length === 0

    if (shouldBePrimary) {
        media.forEach((item) => {
            item.is_primary = false
        })
    }

    const item: ProductMedia = {
        id: nextId("med"),
        url: input.url,
        alt_text: input.alt_text ?? null,
        mime_type: input.mime_type ?? "image/svg+xml",
        file_size: input.file_size ?? null,
        is_primary: shouldBePrimary,
        display_order: media.length,
        created_at: timestamp,
        updated_at: timestamp,
    }

    media.push(item)

    return item
}

async function deleteMedia(productId: string, mediaId: string): Promise<void> {
    const media = ensureMedia(productId)
    const removed = media.find((entry) => entry.id === mediaId)

    if (removed === undefined) {
        throw new Error(`Media ${mediaId} not found`)
    }

    const next = media.filter((entry) => entry.id !== mediaId)

    getDb().mediaByProduct[productId] = next
    resequence(next)

    if (removed.is_primary && next.length > 0) {
        next[0].is_primary = true
    }
}

async function setPrimaryMedia(productId: string, mediaId: string): Promise<ProductMedia> {
    const media = ensureMedia(productId)
    const target = media.find((entry) => entry.id === mediaId)

    if (target === undefined) {
        throw new Error(`Media ${mediaId} not found`)
    }

    media.forEach((item) => {
        item.is_primary = item.id === mediaId
        item.updated_at = nowIso()
    })

    return target
}

async function reorderMedia(productId: string, items: ReorderItem[]): Promise<void> {
    const media = ensureMedia(productId)

    for (const item of items) {
        const entry = media.find((candidate) => candidate.id === item.id)

        if (entry !== undefined) {
            entry.display_order = item.display_order
            entry.updated_at = nowIso()
        }
    }

    media.sort((a, b) => a.display_order - b.display_order)
    resequence(media)
}

export function pickMediaPlaceholder(): Pick<ProductMedia, "url" | "alt_text" | "mime_type" | "file_size"> {
    const index = Math.floor(Math.random() * mediaPlaceholderPool.length)

    return mediaPlaceholderPool[index]
}

function ensureGroups(productId: string): ProductModifierGroup[] {
    const db = getDb()

    findProductOrThrow(productId)

    if (db.modifierGroupsByProduct[productId] === undefined) {
        db.modifierGroupsByProduct[productId] = []
    }

    return db.modifierGroupsByProduct[productId]
}

async function listModifierGroups(productId: string): Promise<ProductModifierGroup[]> {
    return structuredClone(getDb().modifierGroupsByProduct[productId] ?? [])
}

function findGroupOrThrow(productId: string, groupId: string): ProductModifierGroup {
    const group = ensureGroups(productId).find((entry) => entry.id === groupId)

    if (group === undefined) {
        throw new Error(`Modifier group ${groupId} not found`)
    }

    return group
}

async function createModifierGroup(productId: string, input: ModifierGroupCreateInput): Promise<ProductModifierGroup> {
    const groups = ensureGroups(productId)
    const timestamp = nowIso()
    const group: ProductModifierGroup = {
        id: nextId("mgr"),
        name: input.name,
        description: input.description ?? null,
        selection_type: input.selection_type,
        min_selection: input.min_selection,
        max_selection: input.max_selection ?? null,
        is_required: input.is_required,
        status: "active",
        display_order: groups.length,
        created_at: timestamp,
        updated_at: timestamp,
        modifiers: [],
    }

    groups.push(group)

    return group
}

async function updateModifierGroup(
    productId: string,
    groupId: string,
    input: ModifierGroupUpdateInput
): Promise<ProductModifierGroup> {
    const group = findGroupOrThrow(productId, groupId)

    if (input.name !== undefined) group.name = input.name
    if (input.description !== undefined) group.description = input.description
    if (input.selection_type !== undefined) group.selection_type = input.selection_type
    if (input.min_selection !== undefined) group.min_selection = input.min_selection
    if (input.max_selection !== undefined) group.max_selection = input.max_selection
    if (input.is_required !== undefined) group.is_required = input.is_required
    group.updated_at = nowIso()

    return group
}

async function deleteModifierGroup(productId: string, groupId: string): Promise<void> {
    const groups = ensureGroups(productId)
    const next = groups.filter((entry) => entry.id !== groupId)

    if (next.length === groups.length) {
        throw new Error(`Modifier group ${groupId} not found`)
    }

    getDb().modifierGroupsByProduct[productId] = next
    resequence(next)
}

async function setModifierGroupStatus(
    productId: string,
    groupId: string,
    status: CatalogStatus
): Promise<ProductModifierGroup> {
    const group = findGroupOrThrow(productId, groupId)

    group.status = status
    group.updated_at = nowIso()

    return group
}

async function reorderModifierGroups(productId: string, items: ReorderItem[]): Promise<void> {
    const groups = ensureGroups(productId)

    for (const item of items) {
        const group = groups.find((entry) => entry.id === item.id)

        if (group !== undefined) {
            group.display_order = item.display_order
            group.updated_at = nowIso()
        }
    }

    groups.sort((a, b) => a.display_order - b.display_order)
    resequence(groups)
}

async function createModifier(
    productId: string,
    groupId: string,
    input: ModifierCreateInput
): Promise<ProductModifier> {
    const group = findGroupOrThrow(productId, groupId)
    const timestamp = nowIso()
    const modifier: ProductModifier = {
        id: nextId("mod"),
        name: input.name,
        description: input.description ?? null,
        price: input.price,
        is_default: input.is_default ?? false,
        status: "active",
        display_order: group.modifiers.length,
        created_at: timestamp,
        updated_at: timestamp,
    }

    group.modifiers.push(modifier)
    group.updated_at = timestamp

    return modifier
}

function findModifierOrThrow(group: ProductModifierGroup, modifierId: string): ProductModifier {
    const modifier = group.modifiers.find((entry) => entry.id === modifierId)

    if (modifier === undefined) {
        throw new Error(`Modifier ${modifierId} not found`)
    }

    return modifier
}

async function updateModifier(
    productId: string,
    groupId: string,
    modifierId: string,
    input: ModifierUpdateInput
): Promise<ProductModifier> {
    const group = findGroupOrThrow(productId, groupId)
    const modifier = findModifierOrThrow(group, modifierId)

    if (input.name !== undefined) modifier.name = input.name
    if (input.description !== undefined) modifier.description = input.description
    if (input.price !== undefined) modifier.price = input.price
    if (input.is_default !== undefined) modifier.is_default = input.is_default
    modifier.updated_at = nowIso()
    group.updated_at = modifier.updated_at

    return modifier
}

async function deleteModifier(productId: string, groupId: string, modifierId: string): Promise<void> {
    const group = findGroupOrThrow(productId, groupId)
    const next = group.modifiers.filter((entry) => entry.id !== modifierId)

    if (next.length === group.modifiers.length) {
        throw new Error(`Modifier ${modifierId} not found`)
    }

    group.modifiers = next
    resequence(next)
    group.updated_at = nowIso()
}

async function setModifierStatus(
    productId: string,
    groupId: string,
    modifierId: string,
    status: CatalogStatus
): Promise<ProductModifier> {
    const group = findGroupOrThrow(productId, groupId)
    const modifier = findModifierOrThrow(group, modifierId)

    modifier.status = status
    modifier.updated_at = nowIso()
    group.updated_at = modifier.updated_at

    return modifier
}

async function reorderModifiers(productId: string, groupId: string, items: ReorderItem[]): Promise<void> {
    const group = findGroupOrThrow(productId, groupId)

    for (const item of items) {
        const modifier = group.modifiers.find((entry) => entry.id === item.id)

        if (modifier !== undefined) {
            modifier.display_order = item.display_order
            modifier.updated_at = nowIso()
        }
    }

    group.modifiers.sort((a, b) => a.display_order - b.display_order)
    resequence(group.modifiers)
}

function ensureAssignments(productId: string): OutletProductAssignment[] {
    const db = getDb()

    findProductOrThrow(productId)

    if (db.assignmentsByProduct[productId] === undefined) {
        db.assignmentsByProduct[productId] = []
    }

    return db.assignmentsByProduct[productId]
}

async function listAssignments(productId: string): Promise<OutletProductAssignment[]> {
    return structuredClone(getDb().assignmentsByProduct[productId] ?? [])
}

async function assignOutlets(productId: string, outletIds: string[]): Promise<OutletProductAssignment[]> {
    const db = getDb()
    const assignments = ensureAssignments(productId)
    const timestamp = nowIso()

    for (const outletId of outletIds) {
        if (assignments.some((entry) => entry.outlet_id === outletId)) {
            continue
        }

        const outlet = db.outlets.find((entry) => entry.id === outletId)

        if (outlet === undefined) {
            continue
        }

        assignments.push({
            id: nextId("asg"),
            product_id: productId,
            outlet_id: outletId,
            outlet: { id: outlet.id, name: outlet.name, status: outlet.status },
            status: "active",
            availability_status: "available",
            unavailable_reason: null,
            display_order: assignments.length,
            created_at: timestamp,
            updated_at: timestamp,
        })
    }

    return structuredClone(assignments)
}

async function replaceAssignments(productId: string, outletIds: string[]): Promise<OutletProductAssignment[]> {
    const db = getDb()
    const assignments = ensureAssignments(productId)
    const timestamp = nowIso()
    const kept: OutletProductAssignment[] = []
    let order = 0

    for (const outletId of outletIds) {
        const outlet = db.outlets.find((entry) => entry.id === outletId)

        if (outlet === undefined) {
            continue
        }

        const existing = assignments.find((entry) => entry.outlet_id === outletId)

        if (existing !== undefined) {
            existing.display_order = order
            kept.push(existing)
        } else {
            kept.push({
                id: nextId("asg"),
                product_id: productId,
                outlet_id: outletId,
                outlet: { id: outlet.id, name: outlet.name, status: outlet.status },
                status: "active",
                availability_status: "available",
                unavailable_reason: null,
                display_order: order,
                created_at: timestamp,
                updated_at: timestamp,
            })
        }

        order += 1
    }

    db.assignmentsByProduct[productId] = kept

    return structuredClone(kept)
}

async function removeAssignment(productId: string, outletId: string): Promise<void> {
    const assignments = ensureAssignments(productId)
    const next = assignments.filter((entry) => entry.outlet_id !== outletId)

    if (next.length === assignments.length) {
        throw new Error(`Assignment for outlet ${outletId} not found`)
    }

    getDb().assignmentsByProduct[productId] = next
    resequence(next)
}

function findAssignmentOrThrow(assignments: OutletProductAssignment[], outletId: string): OutletProductAssignment {
    const assignment = assignments.find((entry) => entry.outlet_id === outletId)

    if (assignment === undefined) {
        throw new Error(`Assignment for outlet ${outletId} not found`)
    }

    return assignment
}

async function setAssignmentStatus(
    productId: string,
    outletId: string,
    status: CatalogStatus
): Promise<OutletProductAssignment> {
    const assignment = findAssignmentOrThrow(ensureAssignments(productId), outletId)

    assignment.status = status
    assignment.updated_at = nowIso()

    return assignment
}

async function setAssignmentAvailability(
    productId: string,
    outletId: string,
    availability: AvailabilityStatus
): Promise<OutletProductAssignment> {
    const assignment = findAssignmentOrThrow(ensureAssignments(productId), outletId)

    assignment.availability_status = availability
    assignment.unavailable_reason = availability === "available" ? null : assignment.unavailable_reason
    assignment.updated_at = nowIso()

    return assignment
}

export interface ProductViewSummary {
    primary_media_url: string | null
    variant_count: number
    min_price: number | null
}

/**
 * Derived presentation data for list cards (primary image, variant count,
 * "from" price). Not a domain field on Product — computed at read time so the
 * Product contract itself stays backend-exact.
 */
async function viewSummaries(): Promise<Record<string, ProductViewSummary>> {
    const db = getDb()
    const result: Record<string, ProductViewSummary> = {}

    for (const product of db.products) {
        const media = db.mediaByProduct[product.id] ?? []
        const variants = db.variantsByProduct[product.id] ?? []
        const primary = media.find((item) => item.is_primary) ?? media[0]
        const activePrices = variants.filter((variant) => variant.status === "active").map((variant) => variant.price)

        result[product.id] = {
            primary_media_url: primary?.url ?? null,
            variant_count: variants.length,
            min_price:
                product.product_type === "simple"
                    ? product.price
                    : activePrices.length > 0
                      ? Math.min(...activePrices)
                      : null,
        }
    }

    return result
}

export const mockCatalogRepository = {
    products: {
        list: listProducts,
        get: getProduct,
        create: createProduct,
        update: updateProduct,
        delete: deleteProduct,
        activate: (id: string) => setProductStatus(id, "active"),
        deactivate: (id: string) => setProductStatus(id, "inactive"),
        reorder: reorderProducts,
        viewSummaries,
    },
    categories: {
        list: listCategories,
        get: getCategory,
        create: createCategory,
        update: updateCategory,
        delete: deleteCategory,
        activate: (id: string) => setCategoryStatus(id, "active"),
        deactivate: (id: string) => setCategoryStatus(id, "inactive"),
        reorder: reorderCategories,
    },
    variants: {
        list: listVariants,
        create: createVariant,
        update: updateVariant,
        delete: deleteVariant,
        activate: (productId: string, variantId: string) => setVariantStatus(productId, variantId, "active"),
        deactivate: (productId: string, variantId: string) => setVariantStatus(productId, variantId, "inactive"),
        reorder: reorderVariants,
    },
    media: {
        list: listMedia,
        create: createMedia,
        delete: deleteMedia,
        setPrimary: setPrimaryMedia,
        reorder: reorderMedia,
        pickPlaceholder: pickMediaPlaceholder,
    },
    modifierGroups: {
        list: listModifierGroups,
        create: createModifierGroup,
        update: updateModifierGroup,
        delete: deleteModifierGroup,
        activate: (productId: string, groupId: string) => setModifierGroupStatus(productId, groupId, "active"),
        deactivate: (productId: string, groupId: string) => setModifierGroupStatus(productId, groupId, "inactive"),
        reorder: reorderModifierGroups,
    },
    modifiers: {
        create: createModifier,
        update: updateModifier,
        delete: deleteModifier,
        activate: (productId: string, groupId: string, modifierId: string) =>
            setModifierStatus(productId, groupId, modifierId, "active"),
        deactivate: (productId: string, groupId: string, modifierId: string) =>
            setModifierStatus(productId, groupId, modifierId, "inactive"),
        reorder: reorderModifiers,
    },
    productOutlets: {
        list: listAssignments,
        assign: assignOutlets,
        replace: replaceAssignments,
        remove: removeAssignment,
        activate: (productId: string, outletId: string) => setAssignmentStatus(productId, outletId, "active"),
        deactivate: (productId: string, outletId: string) => setAssignmentStatus(productId, outletId, "inactive"),
        setAvailability: setAssignmentAvailability,
    },
    outlets: {
        list: async () => structuredClone(getDb().outlets),
    },
}

export type CatalogRepository = typeof mockCatalogRepository

export const catalogRepository: CatalogRepository = mockCatalogRepository
