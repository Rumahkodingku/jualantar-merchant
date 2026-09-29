import { useProductDraft as useProductDraftQuery } from "../../services/product-draft/product-draft.queries"
import { useDraftForm } from "./use-draft-form"
import { useDraftMedia } from "./use-draft-media"
import { useDraftSync } from "./use-draft-sync"

export { useDraftForm, type WizardData } from "./use-draft-form"
export { useDraftSync, type DraftConflict, type DraftSaveState, type DraftStatus } from "./use-draft-sync"
export { useDraftMedia } from "./use-draft-media"

/**
 * Owns the whole "add product" wizard state and keeps it on the server.
 *
 * Three concerns, split so each can be read on its own:
 *
 * - `useDraftForm`  — what the merchant sees. No network.
 * - `useDraftSync`  — when a change is written, and what happens when the
 *                     server disagrees about the version.
 * - `useDraftMedia` — staging photos before the product exists.
 *
 * They are composed here so the wizard has a single hook to call, and the shape
 * it returns is the wizard's whole contract.
 */
export function useProductDraft({ autosave }: { autosave: boolean }) {
    const draftQuery = useProductDraftQuery()
    const form = useDraftForm()
    const sync = useDraftSync({ autosave, form, draft: draftQuery })
    const media = useDraftMedia({ form })

    return {
        status: sync.status,
        hydrated: sync.hydrated,
        isResumed: sync.isResumed,
        reconcileNotice: sync.reconcileNotice,
        setReconcileNotice: sync.setReconcileNotice,

        stepIndex: form.stepIndex,
        setStepIndex: sync.setStepIndex,
        info: form.data.info,
        patchInfo: form.patchInfo,
        priceRaw: form.data.priceRaw,
        setPriceRaw: form.setPriceRaw,
        variants: form.data.variants,
        setVariants: form.setVariants,
        groups: form.data.groups,
        setGroups: form.setGroups,
        media: form.data.media,
        mediaBusy: media.mediaBusy,
        addMedia: media.addMedia,
        deleteMedia: media.deleteMedia,
        setPrimaryMedia: media.setPrimaryMedia,
        moveMedia: media.moveMedia,
        outletIds: form.data.outletIds,
        setOutletIds: form.setOutletIds,
        submission: form.data.submission ?? null,
        setSubmission: sync.setSubmission,

        saveState: sync.saveState,
        conflict: sync.conflict,
        retrySave: sync.retrySave,
        reloadFromServer: sync.reloadFromServer,
        overwriteConflict: sync.overwriteConflict,
        discard: sync.discard,
        refreshPreviewUrls: sync.refreshPreviewUrls,
        refetch: draftQuery.refetch,
        expiresAt: draftQuery.data?.expires_at ?? null,
        updatedAt: draftQuery.data?.updated_at ?? null,
    }
}
