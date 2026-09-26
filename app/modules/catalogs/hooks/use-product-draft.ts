import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { ApiError, putToStorage } from "~/lib/api"
import { validateUploadFile } from "~/lib/upload"
import { notifyError } from "~/lib/notify"

import { invalidateProductDraft } from "../services/catalog.invalidation"
import {
    isDraftVersionConflict,
    serverVersionFrom,
    useDeleteDraftMedia,
    useDiscardProductDraft,
    useDraftMediaUpload,
    useSaveProductDraft,
} from "../services/product-draft/product-draft.mutations"
import {
    productDraftQueryOptions,
    useProductDraft as useProductDraftQuery,
} from "../services/product-draft/product-draft.queries"
import { productDraftDataSchema, type ProductDraft, type SubmissionProgress } from "../schemas/product-draft.schema"
import type { ProductInfoFormValues } from "../schemas/catalog.schema"
import { draftKey } from "../components/product-wizard/utils"
import { MAX_PRODUCT_MEDIA } from "./use-catalog-media-upload"
import type { GroupDraft, MediaDraft, VariantDraft } from "../components/product-wizard/types"

const AUTOSAVE_DEBOUNCE_MS = 1000

export type DraftStatus = "loading" | "ready" | "error"
export type DraftSaveState = "idle" | "saving" | "saved" | "error"

export interface DraftConflict {
    /** Null when the draft was deleted elsewhere rather than changed. */
    serverVersion: number | null
}

/**
 * The wizard's own view of the draft, in the shapes the wizard components speak.
 * The stored payload is a different shape — mostly empty string versus null — so
 * the two are converted at the edges instead of leaking into components.
 */
interface WizardData {
    info: ProductInfoFormValues
    priceRaw: string
    variants: VariantDraft[]
    groups: GroupDraft[]
    media: MediaDraft[]
    outletIds: string[]
    submission?: SubmissionProgress
}

function emptyWizardData(): WizardData {
    return {
        info: { name: "", category_id: "", description: "", product_type: "simple" },
        priceRaw: "",
        variants: [],
        groups: [],
        media: [],
        outletIds: [],
    }
}

function toWizard(draft: ProductDraft): WizardData {
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
function signature(payload: Record<string, unknown>, step: number): string {
    return JSON.stringify([step, payload])
}

function toPayload(data: WizardData): Record<string, unknown> {
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

/**
 * Owns the whole "add product" wizard state and keeps it on the server.
 *
 * The server is the only source of truth: the form is not rendered until the
 * draft has loaded, because a briefly empty form would autosave straight over a
 * draft that already exists. Every keystroke is debounced into a PUT carrying
 * the version it was based on, so a draft changed in another tab surfaces as a
 * conflict instead of silently overwriting work.
 */
export function useProductDraft({ autosave }: { autosave: boolean }) {
    const queryClient = useQueryClient()
    const draftQuery = useProductDraftQuery()
    const saveDraft = useSaveProductDraft()
    const discardDraft = useDiscardProductDraft()
    const uploadMedia = useDraftMediaUpload()
    const removeMedia = useDeleteDraftMedia()

    const [stepIndex, setStepIndexState] = useState(0)
    const [data, setData] = useState<WizardData>(emptyWizardData)
    const [hydrated, setHydrated] = useState(false)
    const [isResumed, setIsResumed] = useState(false)
    const [saveState, setSaveState] = useState<DraftSaveState>("idle")
    const [conflict, setConflict] = useState<DraftConflict | null>(null)
    const [reconcileNotice, setReconcileNotice] = useState<string | null>(null)

    const expectedVersion = useRef<number | null>(null)
    /** Payload plus step, so moving between steps is a change worth writing. */
    const lastSavedSignature = useRef<string | null>(null)
    const hydratedRef = useRef(false)
    const conflictVersion = useRef<number | null>(null)
    const inFlight = useRef(false)
    const queued = useRef<{ payload: Record<string, unknown>; step: number } | null>(null)

    // `useMutation` hands back a fresh object on every render. Keeping the
    // handles in refs stops that identity churn from reaching the debounce
    // effect, which would otherwise be torn down and re-armed on every render
    // and never actually fire.
    const saveDraftRef = useRef(saveDraft)
    const uploadMediaRef = useRef(uploadMedia)
    const removeMediaRef = useRef(removeMedia)
    const discardDraftRef = useRef(discardDraft)

    saveDraftRef.current = saveDraft
    uploadMediaRef.current = uploadMedia
    removeMediaRef.current = removeMedia
    discardDraftRef.current = discardDraft

    const status: DraftStatus = draftQuery.isPending ? "loading" : draftQuery.isError ? "error" : "ready"

    const adoptDraft = useCallback((draft: ProductDraft) => {
        const wizard = toWizard(draft)

        setData(wizard)
        setStepIndexState(draft.step_index)
        expectedVersion.current = draft.version
        lastSavedSignature.current = signature(toPayload(wizard), draft.step_index)
        hydratedRef.current = true
        setHydrated(true)
    }, [])

    const adoptEmpty = useCallback(() => {
        const empty = emptyWizardData()

        setData(empty)
        setStepIndexState(0)
        setIsResumed(false)
        setReconcileNotice(null)
        expectedVersion.current = null
        // Seeded with the empty form rather than null: after a discard the
        // autosave is about to re-evaluate, and an untouched form must count as
        // "nothing to save" or it would immediately re-create the draft that was
        // just deleted. The next real edit starts a new one.
        lastSavedSignature.current = signature(toPayload(empty), 0)
        hydratedRef.current = true
        setHydrated(true)
    }, [])

    /**
     * Seed the form from the loaded draft exactly once. A later refetch must not
     * overwrite what the merchant is currently typing, so the guard is a ref
     * rather than state.
     */
    useEffect(() => {
        if (hydratedRef.current || draftQuery.data === undefined) {
            return
        }

        if (draftQuery.data === null) {
            adoptEmpty()
            return
        }

        setIsResumed(true)
        adoptDraft(draftQuery.data)
    }, [adoptDraft, adoptEmpty, draftQuery.data])

    /**
     * Writes are serialised.
     *
     * Two saves racing on the same base version make the loser look like a
     * conflict from another tab, which is both wrong and alarming. A request
     * that arrives while one is in flight is therefore held back and re-sent
     * against the version the first one returned, once it settles. Only the most
     * recent held request matters; anything before it is already superseded.
     */
    const send = useCallback(
        async (payload: Record<string, unknown>, step: number, version: number | null): Promise<void> => {
            if (inFlight.current) {
                queued.current = { payload, step }
                return
            }

            inFlight.current = true
            setSaveState("saving")

            try {
                const saved = await saveDraftRef.current.mutateAsync({
                    expected_version: version,
                    step_index: step,
                    data: payload,
                })

                expectedVersion.current = saved.version
                lastSavedSignature.current = signature(payload, step)
                setSaveState("saved")
            } catch (error) {
                setSaveState("error")

                if (isDraftVersionConflict(error)) {
                    conflictVersion.current = serverVersionFrom(error)
                    setConflict({ serverVersion: conflictVersion.current })
                }
            } finally {
                inFlight.current = false
            }

            const next = queued.current

            queued.current = null

            if (next !== null) {
                await send(next.payload, next.step, expectedVersion.current)
            }
        },
        []
    )

    const save = useCallback(
        (next: WizardData, step: number, version: number | null) => {
            const payload = toPayload(next)

            if (signature(payload, step) === lastSavedSignature.current) {
                return
            }

            // Claim the slot now so two callers in the same tick cannot both read
            // the same base version and race each other into a false conflict.
            lastSavedSignature.current = signature(payload, step)
            void send(payload, step, version)
        },
        [send]
    )

    // Debounced autosave. Held back until the draft has loaded, while a submit
    // is in flight so saving cannot race the product being created, and while a
    // conflict is unresolved so the merchant's choice is not overwritten.
    useEffect(() => {
        if (!autosave || !hydrated || conflict !== null) {
            return
        }

        const timer = setTimeout(() => {
            save(data, stepIndex, expectedVersion.current)
        }, AUTOSAVE_DEBOUNCE_MS)

        return () => clearTimeout(timer)
    }, [autosave, conflict, data, hydrated, save, stepIndex])

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

    const patchInfo = useCallback((change: Partial<ProductInfoFormValues>) => {
        setData((current) => ({ ...current, info: { ...current.info, ...change } }))
    }, [])

    /**
     * Leaving a step is a natural checkpoint, so it is written without waiting
     * out the debounce.
     */
    const setStepIndex = useCallback(
        (next: number) => {
            setStepIndexState(next)
            save(data, next, expectedVersion.current)
        },
        [data, save]
    )

    const setSubmission = useCallback(
        (submission: SubmissionProgress) => {
            setData((current) =>
                JSON.stringify(current.submission) === JSON.stringify(submission) ? current : { ...current, submission }
            )
            // Written immediately: a reload after a failed submit has to find
            // the cursors that keep the retry idempotent.
            save({ ...data, submission }, stepIndex, expectedVersion.current)
        },
        [data, save, stepIndex]
    )

    const mediaBusy = useMemo(() => data.media.some((item) => item.status !== "ready"), [data.media])

    const addMedia = useCallback(
        async (file: File) => {
            const validation = validateUploadFile(file, { imagesOnly: true })

            if (validation !== null) {
                notifyError("Foto tidak dapat digunakan", validation)
                return
            }

            if (data.media.length >= MAX_PRODUCT_MEDIA) {
                notifyError("Batas foto tercapai", `Maksimal ${MAX_PRODUCT_MEDIA} foto per produk.`)
                return
            }

            const key = draftKey("med")

            setData((current) => ({
                ...current,
                media: [
                    ...current.media,
                    {
                        key,
                        object_key: "",
                        file_name: file.name,
                        mime_type: file.type,
                        file_size: file.size,
                        preview_url: null,
                        alt_text: "",
                        is_primary: current.media.length === 0,
                        status: "uploading",
                    },
                ],
            }))

            try {
                const target = await uploadMediaRef.current.mutateAsync({
                    file_name: file.name,
                    mime_type: file.type,
                    file_size: file.size,
                })

                await putToStorage(target.upload_url, file, { headers: target.headers })

                setData((current) => ({
                    ...current,
                    media: current.media.map((item) =>
                        item.key === key
                            ? {
                                  ...item,
                                  object_key: target.object_key,
                                  preview_url: target.preview_url,
                                  status: "ready",
                              }
                            : item
                    ),
                }))
            } catch (error) {
                // A half-uploaded object never reaches the payload, so dropping the
                // entry keeps the stored draft self-consistent.
                setData((current) => ({
                    ...current,
                    media: current.media.filter((item) => item.key !== key),
                }))
                notifyError(
                    "Foto gagal diunggah",
                    error instanceof ApiError ? error.detail : "Periksa koneksi lalu pilih foto kembali."
                )
            }
        },
        [data.media.length]
    )

    const dropMedia = useCallback((key: string) => {
        setData((current) => {
            const remaining = current.media.filter((item) => item.key !== key)

            return { ...current, media: remaining.map((item, index) => ({ ...item, is_primary: index === 0 })) }
        })
    }, [])

    const deleteMedia = useCallback(
        async (key: string) => {
            const target = data.media.find((item) => item.key === key)

            if (target === undefined || target.object_key === "") {
                dropMedia(key)
                return
            }

            try {
                await removeMediaRef.current.mutateAsync(target.object_key)
                dropMedia(key)
            } catch {
                // The entry stays so the draft keeps matching storage; the
                // mutation has already told the merchant it failed.
            }
        },
        [data.media, dropMedia]
    )

    const setPrimaryMedia = useCallback((key: string) => {
        setData((current) => ({
            ...current,
            media: current.media.map((item) => ({ ...item, is_primary: item.key === key })),
        }))
    }, [])

    const moveMedia = useCallback((index: number, direction: -1 | 1) => {
        setData((current) => {
            const target = index + direction

            if (target < 0 || target >= current.media.length) {
                return current
            }

            const next = [...current.media]
            const [item] = next.splice(index, 1)

            next.splice(target, 0, item)

            return { ...current, media: next }
        })
    }, [])

    const discard = useCallback(async () => {
        try {
            await discardDraftRef.current.mutateAsync()
        } catch {
            // A failed discard is survivable: the draft expires on its own, and
            // the merchant did ask to start over.
        }

        inFlight.current = false
        queued.current = null
        setSaveState("idle")
        setConflict(null)
        adoptEmpty()
    }, [adoptEmpty])

    /**
     * A forced read. The draft query is kept fresh indefinitely, so a plain
     * `fetchQuery` would hand back the very copy the merchant is trying to get
     * rid of.
     */
    const refetchDraft = useCallback(
        () => queryClient.fetchQuery({ ...productDraftQueryOptions, staleTime: 0 }),
        [queryClient]
    )

    /** Drop the local form and re-read whatever the server holds now. */
    const reloadFromServer = useCallback(async () => {
        setConflict(null)
        hydratedRef.current = false
        setHydrated(false)

        try {
            const draft = await refetchDraft()

            if (draft === null) {
                adoptEmpty()
                return
            }

            setIsResumed(true)
            adoptDraft(draft)
        } catch {
            setHydrated(true)
        }
    }, [adoptDraft, adoptEmpty, refetchDraft])

    /**
     * "Keep mine" re-sends the form against the version the server reported. The
     * API has no force flag, but a conflict response always carries the current
     * version, so re-basing on it is exactly the write the merchant asked for.
     */
    const overwriteConflict = useCallback(() => {
        const version = conflictVersion.current

        setConflict(null)
        lastSavedSignature.current = null
        save(data, stepIndex, version)
    }, [data, save, stepIndex])

    const retrySave = useCallback(() => {
        setConflict(null)
        lastSavedSignature.current = null
        save(data, stepIndex, expectedVersion.current)
    }, [data, save, stepIndex])

    /**
     * Preview URLs are signed and short-lived. When a tile fails to render, the
     * draft is re-read so the server hands back a fresh set, without disturbing
     * the rest of the form.
     */
    const refreshPreviewUrls = useCallback(async () => {
        await invalidateProductDraft(queryClient)
        await refetchDraft()
    }, [queryClient, refetchDraft])

    return {
        status,
        hydrated,
        isResumed,
        reconcileNotice,
        setReconcileNotice,

        stepIndex,
        setStepIndex,
        info: data.info,
        patchInfo,
        priceRaw: data.priceRaw,
        setPriceRaw,
        variants: data.variants,
        setVariants,
        groups: data.groups,
        setGroups,
        media: data.media,
        mediaBusy,
        addMedia,
        deleteMedia,
        setPrimaryMedia,
        moveMedia,
        outletIds: data.outletIds,
        setOutletIds,
        submission: data.submission ?? null,
        setSubmission,

        saveState,
        conflict,
        retrySave,
        reloadFromServer,
        overwriteConflict,
        discard,
        refreshPreviewUrls,
        refetch: draftQuery.refetch,
        expiresAt: draftQuery.data?.expires_at ?? null,
        updatedAt: draftQuery.data?.updated_at ?? null,
    }
}
