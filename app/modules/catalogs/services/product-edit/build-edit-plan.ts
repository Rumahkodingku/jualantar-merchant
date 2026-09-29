import type { EditPlan, GroupChange, ModifierChange, VariantChange } from "./edit-plan.types"
import type {
    EditForm,
    EditSnapshot,
    GroupDraft,
    MediaDraft,
    ModifierDraft,
    ProductMedia,
    ProductModifier,
    ProductModifierGroup,
    ProductVariant,
    VariantDraft,
} from "../../types"

/**
 * What the merchant changed, expressed as the calls that will make it so.
 *
 * The edit screen walks the same six steps as the create screen and collects
 * everything before sending any of it, so the save has to work out for itself
 * which rows are new, which are edited, and which are gone. A row's server id is
 * the only thing that separates the three — the create wizard's rows have none,
 * and the edit wizard's rows are hydrated with theirs — so every decision below
 * turns on whether that id is present.
 *
 * Pure on purpose: this runs on every save and on every retry, and it is the one
 * place where a mistake would quietly drop a row the merchant meant to keep.
 * Anything that needs no change comes back empty, and the save skips it rather
 * than sending a request that would achieve nothing.
 */
export function buildEditPlan({ form, snapshot }: { form: EditForm; snapshot: EditSnapshot }): EditPlan {
    return {
        product: buildProductPatch(form, snapshot),
        variants: buildVariantPlan(form.variants, snapshot.variants),
        customization: buildCustomizationPlan(form.groups, snapshot.groups),
        media: buildMediaPlan(form.media, snapshot.media),
        outlets: buildOutletPlan(form.outletIds, snapshot.outletIds),
    }
}

/**
 * A variable product's price comes from its variants, so its own price is not
 * part of the patch — the API is sent `null` to say so explicitly rather than
 * left to guess from a field that was never in the payload.
 */
function buildProductPatch(form: EditForm, snapshot: EditSnapshot) {
    const description = form.info.description === "" ? null : form.info.description
    const price = form.info.product_type === "simple" ? toPrice(form.priceRaw) : null

    const unchanged =
        form.info.name === snapshot.name &&
        form.info.category_id === snapshot.category_id &&
        description === snapshot.description &&
        price === snapshot.price

    if (unchanged) {
        return null
    }

    return {
        name: form.info.name,
        category_id: form.info.category_id,
        description,
        price,
    }
}

function toPrice(raw: string): number | null {
    if (raw.trim() === "") {
        return null
    }

    const parsed = Number(raw)

    return Number.isFinite(parsed) ? parsed : null
}

function buildVariantPlan(variants: VariantDraft[], snapshot: ProductVariant[]) {
    const before = new Map(snapshot.map((variant) => [variant.id, variant]))
    const kept = new Set<string>()

    const create: EditPlan["variants"]["create"] = []
    const update: VariantChange[] = []

    for (const variant of variants) {
        if (variant.id === undefined) {
            create.push({
                name: variant.name,
                sku: variant.sku === "" ? null : variant.sku,
                price: variant.price,
                is_default: variant.is_default,
            })
            continue
        }

        const id = variant.id

        kept.add(id)
        const change = diffVariant(id, variant, before.get(id))

        if (change !== null) {
            update.push(change)
        }
    }

    return {
        create,
        update,
        remove: snapshot.filter((variant) => !kept.has(variant.id)).map((variant) => variant.id),
        reorder: diffOrder(
            variants.filter((variant) => variant.id !== undefined),
            snapshot
        ),
    }
}

/**
 * `status` is null when it has not moved, because the field is not part of the
 * patch and moving it means a separate call the save should skip.
 */
function diffVariant(id: string, variant: VariantDraft, before: ProductVariant | undefined): VariantChange | null {
    if (before === undefined) {
        return null
    }

    const name = variant.name !== before.name ? variant.name : undefined
    const sku =
        (variant.sku === "" ? null : variant.sku) !== before.sku ? (variant.sku === "" ? null : variant.sku) : undefined
    const price = variant.price !== before.price ? variant.price : undefined
    const is_default = variant.is_default !== before.is_default ? variant.is_default : undefined

    const update = {
        ...(name !== undefined ? { name } : {}),
        ...(sku !== undefined ? { sku } : {}),
        ...(price !== undefined ? { price } : {}),
        ...(is_default !== undefined ? { is_default } : {}),
    }
    const status = variant.status !== before.status ? variant.status : null

    // A row that only moved status still needs a call, so the two are weighed
    // together — returning early on an empty patch would drop it silently.
    if (Object.keys(update).length === 0 && status === null) {
        return null
    }

    return { id, update, status }
}

function buildCustomizationPlan(groups: GroupDraft[], snapshot: ProductModifierGroup[]) {
    const before = new Map(snapshot.map((group) => [group.id, group]))
    const kept = new Set<string>()

    const create: EditPlan["customization"]["groups"]["create"] = []
    const update: GroupChange[] = []

    for (const group of groups) {
        if (group.id === undefined) {
            create.push({
                group: {
                    name: group.name,
                    description: nullIfEmpty(group.description),
                    selection_type: group.selection_type,
                    min_selection: group.min_selection,
                    max_selection: group.max_selection,
                    is_required: group.is_required,
                },
                modifiers: group.modifiers.map(toModifierCreateInput),
            })
            continue
        }

        kept.add(group.id)
        const previous = before.get(group.id)

        if (previous === undefined) {
            continue
        }

        const groupUpdate = diffGroup(group, previous)
        const modifiers = diffModifiers(group.modifiers, previous.modifiers)

        if (groupUpdate === null && isModifierGroupEmpty(modifiers)) {
            continue
        }

        update.push({
            id: group.id,
            update: groupUpdate?.update ?? {},
            status: groupUpdate?.status ?? null,
            modifiers,
        })
    }

    return {
        groups: {
            create,
            update,
            remove: snapshot.filter((group) => !kept.has(group.id)).map((group) => group.id),
            reorder: diffOrder(
                groups.filter((group) => group.id !== undefined),
                snapshot
            ),
        },
    }
}

function toModifierCreateInput(modifier: ModifierDraft) {
    return {
        name: modifier.name,
        description: nullIfEmpty(modifier.description),
        price: modifier.price,
        is_default: modifier.is_default,
    }
}

function diffGroup(group: GroupDraft, before: ProductModifierGroup) {
    const description = nullIfEmpty(group.description)

    const update = {
        ...(group.name !== before.name ? { name: group.name } : {}),
        ...(description !== before.description ? { description } : {}),
        ...(group.selection_type !== before.selection_type ? { selection_type: group.selection_type } : {}),
        ...(group.min_selection !== before.min_selection ? { min_selection: group.min_selection } : {}),
        ...(group.max_selection !== before.max_selection ? { max_selection: group.max_selection } : {}),
        ...(group.is_required !== before.is_required ? { is_required: group.is_required } : {}),
    }

    const status = group.status !== before.status ? group.status : null

    if (Object.keys(update).length === 0 && status === null) {
        return null
    }

    return { update, status }
}

function diffModifiers(modifiers: ModifierDraft[], snapshot: ProductModifier[]) {
    const before = new Map(snapshot.map((modifier) => [modifier.id, modifier]))
    const kept = new Set<string>()

    const create: Array<{ name: string; description: string | null; price: number; is_default: boolean }> = []
    const update: ModifierChange[] = []

    for (const modifier of modifiers) {
        if (modifier.id === undefined) {
            create.push(toModifierCreateInput(modifier))
            continue
        }

        kept.add(modifier.id)
        const previous = before.get(modifier.id)

        if (previous === undefined) {
            continue
        }

        const description = nullIfEmpty(modifier.description)
        const input = {
            ...(modifier.name !== previous.name ? { name: modifier.name } : {}),
            ...(description !== previous.description ? { description } : {}),
            ...(modifier.price !== previous.price ? { price: modifier.price } : {}),
            ...(modifier.is_default !== previous.is_default ? { is_default: modifier.is_default } : {}),
        }

        // As with a variant, a status-only change is still a change.
        const status = modifier.status !== previous.status ? modifier.status : null

        if (Object.keys(input).length > 0 || status !== null) {
            update.push({ id: modifier.id, update: input, status })
        }
    }

    return {
        create,
        update,
        remove: snapshot.filter((modifier) => !kept.has(modifier.id)).map((modifier) => modifier.id),
        reorder: diffOrder(
            modifiers.filter((modifier) => modifier.id !== undefined),
            snapshot
        ),
    }
}

function isModifierGroupEmpty(modifiers: ReturnType<typeof diffModifiers>): boolean {
    return (
        modifiers.create.length === 0 &&
        modifiers.update.length === 0 &&
        modifiers.remove.length === 0 &&
        modifiers.reorder === null
    )
}

/**
 * A reorder is only worth a request when the order actually moved. Comparing
 * the surviving rows' ids against the snapshot is enough: if the two sequences
 * match, nothing about the order can have changed.
 */
function diffOrder<T extends { id?: string }>(rows: T[], snapshot: Array<{ id: string }>) {
    const kept = snapshot.map((row) => row.id)
    const current = rows.map((row) => row.id as string)

    if (kept.length !== current.length || kept.some((id, index) => id !== current[index])) {
        return current.map((id, display_order) => ({ id, display_order }))
    }

    return null
}

/**
 * Media is a list of photos rather than rows the merchant renames, so the only
 * thing to work out is what to register, what to remove, which one leads, and
 * whether the order moved. The new photos are already uploaded by the time the
 * plan is built — the step that picks them uploads immediately — so registering
 * one is just pointing at a stored object.
 */
function buildMediaPlan(media: MediaDraft[], snapshot: ProductMedia[]) {
    const kept = new Set<string>()

    const create: EditPlan["media"]["create"] = []

    for (const [index, item] of media.entries()) {
        if (item.id !== undefined) {
            kept.add(item.id)
            continue
        }

        if (item.status !== "ready" || item.object_key === "") {
            continue
        }

        create.push({
            object_key: item.object_key,
            alt_text: nullIfEmpty(item.alt_text),
            is_primary: item.is_primary,
            display_order: index,
        })
    }

    return {
        create,
        remove: snapshot.filter((item) => !kept.has(item.id)).map((item) => item.id),
        primaryId: primaryMediaId(media),
        reorder: diffOrder(
            media.filter((item) => item.id !== undefined),
            snapshot
        ),
    }
}

/**
 * The lead photo is set through its own endpoint, and only a photo that already
 * exists has an id to set it by. A product whose only photo is new gets its lead
 * from the `is_primary` flag on the create call instead.
 */
function primaryMediaId(media: MediaDraft[]): string | null {
    const lead = media.find((item) => item.is_primary)

    return lead?.id ?? null
}

function buildOutletPlan(outletIds: string[], snapshot: string[]): { replace: string[] | null } {
    if (outletIds.length === snapshot.length && outletIds.every((id, index) => id === snapshot[index])) {
        return { replace: null }
    }

    return { replace: [...outletIds] }
}

function nullIfEmpty(value: string): string | null {
    return value === "" ? null : value
}
