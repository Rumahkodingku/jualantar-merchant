import { useCallback, useMemo, useRef } from "react"

import { ApiError, putToStorage } from "~/lib/api"
import { validateUploadFile } from "~/lib/upload"
import { notifyError } from "~/lib/notify"

import { useDeleteDraftMedia, useDraftMediaUpload } from "../../services/product-draft/product-draft.mutations"
import { draftKey } from "../../utils/draft-key"
import { MAX_PRODUCT_MEDIA } from "../../utils/media"
import type { DraftForm } from "./use-draft-form"

/**
 * Photos the wizard stages before the product exists.
 *
 * A picked file is uploaded the moment it is chosen and the draft keeps the
 * storage key, not the bytes — that is what lets a staged photo survive a
 * reload. Removal has to go through the API so the stored object does not
 * outlive the draft entry pointing at it.
 */
export function useDraftMedia({ form }: { form: DraftForm }) {
    const uploadMedia = useDraftMediaUpload()
    const removeMedia = useDeleteDraftMedia()

    // As in `useDraftSync`: the mutation handle changes identity every render,
    // and the upload callbacks below are deps of the form's autosave effect.
    const uploadMediaRef = useRef(uploadMedia)
    const removeMediaRef = useRef(removeMedia)

    uploadMediaRef.current = uploadMedia
    removeMediaRef.current = removeMedia

    const mediaBusy = useMemo(() => form.data.media.some((item) => item.status !== "ready"), [form.data.media])

    const addMedia = useCallback(
        async (file: File) => {
            const validation = validateUploadFile(file, { imagesOnly: true })

            if (validation !== null) {
                notifyError("Foto tidak dapat digunakan", validation)
                return
            }

            if (form.data.media.length >= MAX_PRODUCT_MEDIA) {
                notifyError("Batas foto tercapai", `Maksimal ${MAX_PRODUCT_MEDIA} foto per produk.`)
                return
            }

            const key = draftKey("med")

            form.setData((current) => ({
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

                form.setData((current) => ({
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
                form.setData((current) => ({
                    ...current,
                    media: current.media.filter((item) => item.key !== key),
                }))
                notifyError(
                    "Foto gagal diunggah",
                    error instanceof ApiError ? error.detail : "Periksa koneksi lalu pilih foto kembali."
                )
            }
        },
        [form]
    )

    /**
     * The first photo is always the cover, so removing one hands the job to
     * whatever is now first.
     */
    const dropMedia = useCallback(
        (key: string) => {
            form.setData((current) => {
                const remaining = current.media.filter((item) => item.key !== key)

                return { ...current, media: remaining.map((item, index) => ({ ...item, is_primary: index === 0 })) }
            })
        },
        [form]
    )

    const deleteMedia = useCallback(
        async (key: string) => {
            const target = form.data.media.find((item) => item.key === key)

            // Never uploaded, so there is nothing stored to remove.
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
        [form.data.media, dropMedia]
    )

    const setPrimaryMedia = useCallback(
        (key: string) => {
            form.setData((current) => ({
                ...current,
                media: current.media.map((item) => ({ ...item, is_primary: item.key === key })),
            }))
        },
        [form]
    )

    const moveMedia = useCallback(
        (index: number, direction: -1 | 1) => {
            form.setData((current) => {
                const target = index + direction

                if (target < 0 || target >= current.media.length) {
                    return current
                }

                const next = [...current.media]
                const [item] = next.splice(index, 1)

                next.splice(target, 0, item)

                return { ...current, media: next }
            })
        },
        [form]
    )

    return { mediaBusy, addMedia, deleteMedia, setPrimaryMedia, moveMedia }
}
