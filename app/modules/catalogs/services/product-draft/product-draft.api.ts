import { api } from "~/lib/api"

import { productDraftSchema, type ProductDraft, type SubmissionProgress } from "../../schemas/product-draft.schema"
import type { MediaUploadTarget, MediaUploadUrlInput } from "../../types/catalog.types"

const BASE = "/merchant/catalog/product-draft"

export interface SaveProductDraftInput {
    expected_version: number | null
    step_index: number
    data: Record<string, unknown>
}

export interface DraftMediaUploadTarget extends MediaUploadTarget {
    preview_url: string | null
}

function toProductDraft(data: unknown): ProductDraft {
    return productDraftSchema.parse(data)
}

/**
 * The merchant's resumable wizard state, or null when there is nothing to
 * resume. The API answers 204 rather than a null body for the empty case.
 */
export async function fetchProductDraft(): Promise<ProductDraft | null> {
    const response = await api.get<{ data: ProductDraft } | null>(BASE)

    if (response.status === 204 || response.data === null || response.data === undefined) {
        return null
    }

    return toProductDraft(response.data.data)
}

export async function saveProductDraft(input: SaveProductDraftInput): Promise<ProductDraft> {
    const { data } = await api.put<{ data: ProductDraft }>(BASE, input)

    return toProductDraft(data.data)
}

export async function discardProductDraft(): Promise<void> {
    await api.delete(BASE)
}

export async function createDraftMediaUploadUrl(input: MediaUploadUrlInput): Promise<DraftMediaUploadTarget> {
    const { data } = await api.post<{ data: DraftMediaUploadTarget }>(`${BASE}/media/upload-url`, input)

    return data.data
}

/**
 * Removing a staged photo also rewrites the draft payload, so the response is
 * the authoritative payload to keep rendering from.
 */
export async function deleteDraftMedia(objectKey: string): Promise<ProductDraft> {
    const { data } = await api.delete<{ data: ProductDraft }>(`${BASE}/media`, {
        data: { object_key: objectKey },
    })

    return toProductDraft(data.data)
}

export function toDraftData(input: {
    info: Record<string, unknown>
    priceRaw: string
    variants: unknown[]
    modifierGroups: unknown[]
    media: unknown[]
    outletIds: string[]
    submission: SubmissionProgress | null
}): Record<string, unknown> {
    return {
        info: input.info,
        price_raw: input.priceRaw,
        variants: input.variants,
        modifier_groups: input.modifierGroups,
        media: input.media,
        outlet_ids: input.outletIds,
        ...(input.submission === null ? {} : { submission: input.submission }),
    }
}
