import { z } from "zod"

/**
 * Read-side schema for the server-persisted wizard draft.
 *
 * The draft is untyped jsonb on the server and may have been written by an
 * older version of this app, so every leaf is forgiving: an unreadable field
 * falls back to the value a fresh wizard starts from instead of throwing and
 * leaving the merchant with an empty form. `SaveProductDraftRequest` on the API
 * is the contract that decides what is actually accepted on write.
 */

const draftText = z.string().catch("")
const optionalText = z.string().nullable().catch(null)
const draftBoolean = z.boolean().catch(false)
const draftMoney = z.number().catch(0)

const draftUuidList = z.array(z.string().catch("")).catch([])

const draftInfoSchema = z.object({
    name: draftText,
    category_id: optionalText,
    description: optionalText,
    product_type: z.enum(["simple", "variable"]).catch("simple"),
})

const draftVariantSchema = z.object({
    key: draftText,
    name: draftText,
    sku: optionalText,
    price: draftMoney,
    status: z.enum(["active", "inactive"]).catch("active"),
    is_default: draftBoolean,
})

const draftModifierSchema = z.object({
    key: draftText,
    name: draftText,
    description: optionalText,
    price: draftMoney,
    is_default: draftBoolean,
    status: z.enum(["active", "inactive"]).catch("active"),
})

const draftModifierGroupSchema = z.object({
    key: draftText,
    name: draftText,
    description: optionalText,
    selection_type: z.enum(["single", "multiple"]).catch("single"),
    min_selection: z.number().int().min(0).catch(0),
    max_selection: z.number().int().min(0).nullable().catch(null),
    is_required: draftBoolean,
    status: z.enum(["active", "inactive"]).catch("active"),
    modifiers: z.array(draftModifierSchema).catch([]),
})

const draftMediaSchema = z.object({
    key: draftText,
    object_key: draftText,
    file_name: draftText,
    mime_type: z.string().catch("image/jpeg"),
    file_size: z.number().int().min(0).catch(0),
    alt_text: optionalText,
    is_primary: draftBoolean,
    preview_url: optionalText,
})

/**
 * How far a previous submit attempt got. Replaying it from these cursors keeps
 * a retry idempotent, so a refresh halfway through saving a product cannot
 * create a second one.
 */
export const submissionProgressSchema = z.object({
    productId: z.string().nullable().catch(null),
    createdVariants: z.number().int().min(0).catch(0),
    createdGroupIds: z.array(z.string().catch("")).catch([]),
    createdModifierCounts: z.array(z.number().int().min(0)).catch([]),
    createdMedia: z.number().int().min(0).catch(0),
    outletsReplaced: z.boolean().catch(false),
})

export const productDraftDataSchema = z.object({
    info: draftInfoSchema.catch(draftInfoSchema.parse({})),
    price_raw: draftText,
    variants: z.array(draftVariantSchema).catch([]),
    modifier_groups: z.array(draftModifierGroupSchema).catch([]),
    media: z.array(draftMediaSchema).catch([]),
    outlet_ids: draftUuidList,
    submission: submissionProgressSchema.optional(),
})

export const productDraftSchema = z.object({
    id: z.string().catch(""),
    version: z.number().int().min(0).catch(0),
    step_index: z.number().int().min(0).max(5).catch(0),
    data: productDraftDataSchema,
    expires_at: z.string().nullable().catch(null),
    updated_at: z.string().nullable().catch(null),
})

export type SubmissionProgress = z.infer<typeof submissionProgressSchema>
export type ProductDraftData = z.infer<typeof productDraftDataSchema>
export type ProductDraft = z.infer<typeof productDraftSchema>
export type DraftVariant = z.infer<typeof draftVariantSchema>
export type DraftModifier = z.infer<typeof draftModifierSchema>
export type DraftModifierGroup = z.infer<typeof draftModifierGroupSchema>
export type DraftMedia = z.infer<typeof draftMediaSchema>

/** The state a merchant's wizard starts from when no draft exists. */
export function emptyDraftData(): ProductDraftData {
    return {
        info: {
            name: "",
            category_id: null,
            description: null,
            product_type: "simple",
        },
        price_raw: "",
        variants: [],
        modifier_groups: [],
        media: [],
        outlet_ids: [],
    }
}
