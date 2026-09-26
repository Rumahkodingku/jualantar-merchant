import { useMutation, useQueryClient } from "@tanstack/react-query"

import * as productDraftApi from "./product-draft.api"

import { ApiError } from "~/lib/api"

import { catalogKeys } from "../catalog.keys"
import { notifyError } from "~/lib/notify"

export const DRAFT_VERSION_CONFLICT = "product_draft_version_conflict"

export function isDraftVersionConflict(error: unknown): error is ApiError {
    return error instanceof ApiError && error.code === DRAFT_VERSION_CONFLICT
}

/**
 * The version the server is currently on, taken from the conflict problem
 * response. It is null when the draft was deleted rather than changed, in which
 * case saving again simply re-creates it.
 */
export function serverVersionFrom(error: unknown): number | null {
    if (!isDraftVersionConflict(error)) {
        return null
    }

    const version = error.context.version

    return typeof version === "number" ? version : null
}

export function useSaveProductDraft() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: productDraftApi.saveProductDraft,
        onSuccess: (draft) => {
            queryClient.setQueryData(catalogKeys.productDraft(), draft)
        },
    })
}

export function useDiscardProductDraft() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: productDraftApi.discardProductDraft,
        onSuccess: () => {
            queryClient.setQueryData(catalogKeys.productDraft(), null)
        },
    })
}

export function useDraftMediaUpload() {
    return useMutation({ mutationFn: productDraftApi.createDraftMediaUploadUrl })
}

export function useDeleteDraftMedia() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: productDraftApi.deleteDraftMedia,
        onSuccess: (draft) => {
            // The response carries the trimmed payload and the bumped version,
            // but its media entries have no freshly signed preview URL. Only the
            // version is adopted here; the media list stays in the hook, which
            // still holds the preview URLs it rendered from.
            queryClient.setQueryData(catalogKeys.productDraft(), (current) => {
                if (current === null || current === undefined) {
                    return current
                }

                return { ...current, version: draft.version, step_index: draft.step_index }
            })
        },
        onError: (error) => {
            notifyError(
                "Foto tidak dapat dihapus",
                error instanceof ApiError ? error.detail : "Coba lagi beberapa saat lagi."
            )
        },
    })
}
