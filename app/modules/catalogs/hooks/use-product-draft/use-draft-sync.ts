import { useCallback, useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { invalidateProductDraft } from "../../services/catalog.invalidation"
import {
    isDraftVersionConflict,
    serverVersionFrom,
    useDiscardProductDraft,
    useSaveProductDraft,
} from "../../services/product-draft/product-draft.mutations"
import { productDraftQueryOptions } from "../../services/product-draft/product-draft.queries"
import type { ProductDraft, SubmissionProgress } from "../../schemas/product-draft.schema"
import { emptyWizardData, signature, toPayload, toWizard, type DraftForm, type WizardData } from "./use-draft-form"

const AUTOSAVE_DEBOUNCE_MS = 1000

export type DraftStatus = "loading" | "ready" | "error"
export type DraftSaveState = "idle" | "saving" | "saved" | "error"

export interface DraftConflict {
    /** Null when the draft was deleted elsewhere rather than changed. */
    serverVersion: number | null
}

/**
 * Keeps the form on the server, and decides when a write is allowed to happen.
 *
 * The server is the only source of truth: the form is not rendered until the
 * draft has loaded, because a briefly empty form would autosave straight over a
 * draft that already exists. Every keystroke is debounced into a PUT carrying
 * the version it was based on, so a draft changed in another tab surfaces as a
 * conflict instead of silently overwriting work.
 */
export function useDraftSync({
    autosave,
    form,
    draft,
}: {
    /** Off while a submit is in flight, so saving cannot race the create. */
    autosave: boolean
    form: DraftForm
    draft: { data: ProductDraft | null | undefined; isPending: boolean; isError: boolean }
}) {
    const queryClient = useQueryClient()
    const saveDraft = useSaveProductDraft()
    const discardDraft = useDiscardProductDraft()

    const [hydrated, setHydrated] = useState(false)
    const [isResumed, setIsResumed] = useState(false)
    const [saveState, setSaveState] = useState<DraftSaveState>("idle")
    const [conflict, setConflict] = useState<DraftConflict | null>(null)
    /**
     * Set when a restored draft referenced something that no longer exists —
     * an outlet deleted in another session, say. The wizard decides when to
     * mention it, so it lives here next to the other draft-level notices.
     */
    const [reconcileNotice, setReconcileNotice] = useState<string | null>(null)

    const expectedVersion = useRef<number | null>(null)
    /** Payload plus step, so moving between steps is a change worth writing. */
    const lastSavedSignature = useRef<string | null>(null)
    const hydratedRef = useRef(false)
    const conflictVersion = useRef<number | null>(null)
    const inFlight = useRef(false)
    const queued = useRef<{ payload: Record<string, unknown>; step: number } | null>(null)

    // `useMutation` hands back a fresh object on every render. Keeping the
    // handle in a ref stops that identity churn from reaching the debounce
    // effect, which would otherwise be torn down and re-armed on every render
    // and never actually fire.
    const saveDraftRef = useRef(saveDraft)

    saveDraftRef.current = saveDraft

    const status: DraftStatus = draft.isPending ? "loading" : draft.isError ? "error" : "ready"

    const adoptDraft = useCallback(
        (value: ProductDraft) => {
            const wizard = toWizard(value)

            form.adopt(wizard, value.step_index)
            expectedVersion.current = value.version
            lastSavedSignature.current = signature(toPayload(wizard), value.step_index)
            hydratedRef.current = true
            setHydrated(true)
        },
        [form]
    )

    const adoptEmpty = useCallback(() => {
        const empty = emptyWizardData()

        form.adopt(empty, 0)
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
    }, [form])

    /**
     * Seed the form from the loaded draft exactly once. A later refetch must not
     * overwrite what the merchant is currently typing, so the guard is a ref
     * rather than state.
     */
    useEffect(() => {
        if (hydratedRef.current || draft.data === undefined) {
            return
        }

        if (draft.data === null) {
            adoptEmpty()
            return
        }

        setIsResumed(true)
        adoptDraft(draft.data)
    }, [adoptDraft, adoptEmpty, draft.data])

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
            save(form.data, form.stepIndex, expectedVersion.current)
        }, AUTOSAVE_DEBOUNCE_MS)

        return () => clearTimeout(timer)
    }, [autosave, conflict, form.data, form.stepIndex, hydrated, save])

    /**
     * Leaving a step is a natural checkpoint, so it is written without waiting
     * out the debounce.
     */
    const setStepIndex = useCallback(
        (next: number) => {
            form.setStepIndex(next)
            save(form.data, next, expectedVersion.current)
        },
        [form, save]
    )

    const setSubmission = useCallback(
        (submission: SubmissionProgress) => {
            form.writeSubmission(submission)
            // Written immediately: a reload after a failed submit has to find
            // the cursors that keep the retry idempotent.
            save({ ...form.data, submission }, form.stepIndex, expectedVersion.current)
        },
        [form, save]
    )

    const discard = useCallback(async () => {
        try {
            await discardDraft.mutateAsync()
        } catch {
            // A failed discard is survivable: the draft expires on its own, and
            // the merchant did ask to start over.
        }

        inFlight.current = false
        queued.current = null
        setSaveState("idle")
        setConflict(null)
        adoptEmpty()
    }, [adoptEmpty, discardDraft])

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
            const value = await refetchDraft()

            if (value === null) {
                adoptEmpty()
                return
            }

            setIsResumed(true)
            adoptDraft(value)
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
        save(form.data, form.stepIndex, version)
    }, [form.data, form.stepIndex, save])

    const retrySave = useCallback(() => {
        setConflict(null)
        lastSavedSignature.current = null
        save(form.data, form.stepIndex, expectedVersion.current)
    }, [form.data, form.stepIndex, save])

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
        saveState,
        conflict,
        save,
        setStepIndex,
        setSubmission,
        discard,
        reloadFromServer,
        overwriteConflict,
        retrySave,
        refreshPreviewUrls,
    }
}
