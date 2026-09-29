import { useCallback, useState } from "react"

import { productDraftDataSchema, type ProductDraft, type SubmissionProgress } from "../../schemas/product-draft.schema"
import type { ProductInfoFormValues } from "../../schemas"
import type { GroupDraft, MediaDraft, VariantDraft } from "../../types/product-draft.types"

/**
 * The wizard's own view of a draft, in the shapes the wizard components speak.
 * The stored payload is a different shape — mostly empty string versus null — so
 * the two are converted at the edges instead of leaking into components.
 */
export interface WizardData {
    info: ProductInfoFormValues
    priceRaw: string
    variants: VariantDraft[]
    groups: GroupDraft[]
    media: MediaDraft[]
    outletIds: string[]
    submission?: SubmissionProgress
}

export function emptyWizardData(): WizardData {
    return {
        info: { name: "", category_id: "", description: "", product_type: "simple" },
        priceRaw: "",
        variants: [],
        groups: [],
        media: [],
        outletIds: [],
    }
}

export function toWizard(draft: ProductDraft): WizardData {
    const data = productDraftDataSchema.parse(draft.data)

    return {
        info: {
            name: data.info.name,
            category_id: data.info.category_id ?? "",
            description: data.info.description ?? "",
            product_type: data.info.product_type,
        },
        priceRaw: data.price_raw,
        variants: data.variants.map((variant) => ({ ...variant, sku: variant.sku ?? "" })),
        groups: data.modifier_groups.map((group) => ({
            ...group,
            description: group.description ?? "",
            modifiers: group.modifiers.map((modifier) => ({
                ...modifier,
                description: modifier.description ?? "",
            })),
        })),
        media: data.media.map((item) => ({
            key: item.key,
            object_key: item.object_key,
            file_name: item.file_name,
            mime_type: item.mime_type,
            file_size: item.file_size,
            preview_url: item.preview_url,
            alt_text: item.alt_text ?? "",
            is_primary: item.is_primary,
            // An entry with no key is one whose upload never completed; it is
            // never written to the payload, so it is dropped on restore instead.
            status: "ready",
        })),
        outletIds: data.outlet_ids,
        ...(data.submission === undefined ? {} : { submission: data.submission }),
    }
}

/**
 * What the server would hold after a write. The step is part of it because the
 * resume banner promises to put the merchant back on the step they left, so
 * moving between steps is a change worth writing on its own.
 */
export function signature(payload: Record<string, unknown>, step: number): string {
    return JSON.stringify([step, payload])
}

export function toPayload(data: WizardData): Record<string, unknown> {
    return {
        info: {
            name: data.info.name,
            category_id: data.info.category_id === "" ? null : data.info.category_id,
            description: data.info.description === "" ? null : data.info.description,
            product_type: data.info.product_type,
        },
        price_raw: data.priceRaw,
        variants: data.variants.map((variant) => ({ ...variant, sku: variant.sku === "" ? null : variant.sku })),
        modifier_groups: data.groups.map((group) => ({
            ...group,
            description: group.description === "" ? null : group.description,
            modifiers: group.modifiers.map((modifier) => ({
                ...modifier,
                description: modifier.description === "" ? null : modifier.description,
            })),
        })),
        // Photos still uploading are left out: the API only accepts an entry that
        // resolves to a stored object, and a key whose bytes never arrived would
        // be rejected as `upload_invalid` when the product is created.
        media: data.media
            .filter((item) => item.status === "ready" && item.object_key !== "")
            .map((item) => ({
                key: item.key,
                object_key: item.object_key,
                file_name: item.file_name,
                mime_type: item.mime_type,
                file_size: item.file_size,
                alt_text: item.alt_text === "" ? null : item.alt_text,
                is_primary: item.is_primary,
            })),
        outlet_ids: data.outletIds,
        ...(data.submission === undefined ? {} : { submission: data.submission }),
    }
}

/** The handle `useDraftSync` and `useDraftMedia` work against. */
export interface DraftForm {
    data: WizardData
    setData: React.Dispatch<React.SetStateAction<WizardData>>
    stepIndex: number
    /** Moves between steps. Whether that is written immediately is sync's call. */
    setStepIndex: (step: number) => void
    /** Replace the whole form, e.g. when a stored draft is restored. */
    adopt: (data: WizardData, step: number) => void
    /** Back to a pristine form, on the first step. */
    clear: () => void
    patchInfo: (change: Partial<ProductInfoFormValues>) => void
    setPriceRaw: (value: string) => void
    setVariants: (value: VariantDraft[]) => void
    setGroups: (value: GroupDraft[]) => void
    setOutletIds: (value: string[]) => void
    writeSubmission: (submission: SubmissionProgress) => void
}

/**
 * The wizard's form state, with no knowledge of the network.
 *
 * Everything here is what the merchant sees; whether a change reaches the
 * server is `useDraftSync`'s business. Keeping the two apart is what lets the
 * autosave rules be reasoned about without rereading the whole form.
 */
export function useDraftForm(): DraftForm {
    const [data, setData] = useState<WizardData>(emptyWizardData)
    const [stepIndex, setStepIndex] = useState(0)

    const adopt = useCallback((next: WizardData, step: number) => {
        setData(next)
        setStepIndex(step)
    }, [])

    const clear = useCallback(() => {
        setData(emptyWizardData())
        setStepIndex(0)
    }, [])

    const patchInfo = useCallback((change: Partial<ProductInfoFormValues>) => {
        setData((current) => ({ ...current, info: { ...current.info, ...change } }))
    }, [])

    const setPriceRaw = useCallback((value: string) => {
        setData((current) => ({ ...current, priceRaw: value }))
    }, [])

    const setVariants = useCallback((value: VariantDraft[]) => {
        setData((current) => ({ ...current, variants: value }))
    }, [])

    const setGroups = useCallback((value: GroupDraft[]) => {
        setData((current) => ({ ...current, groups: value }))
    }, [])

    const setOutletIds = useCallback((value: string[]) => {
        setData((current) => ({ ...current, outletIds: value }))
    }, [])

    const writeSubmission = useCallback((submission: SubmissionProgress) => {
        setData((current) =>
            JSON.stringify(current.submission) === JSON.stringify(submission) ? current : { ...current, submission }
        )
    }, [])

    return {
        data,
        setData,
        stepIndex,
        setStepIndex,
        adopt,
        clear,
        patchInfo,
        setPriceRaw,
        setVariants,
        setGroups,
        setOutletIds,
        writeSubmission,
    }
}
