import { useCallback, useMemo } from "react"

import { ApiError, putToStorage } from "~/lib/api"
import { validateUploadFile } from "~/lib/upload"
import { notifyError } from "~/lib/notify"

import * as mediaApi from "../services/media/media.api"
import { draftKey } from "../utils/draft-key"
import { MAX_PRODUCT_MEDIA } from "../utils/media"
import type { EditForm, MediaDraft } from "../types"

/**
 * Photos for a product that already exists.
 *
 * The storage half is the same as the create wizard's — a picked file is
 * uploaded straight away and the form keeps the storage key rather than the
 * bytes — but the target is the product's own upload endpoint, because there is
 * no draft to hang an upload off. Nothing is registered yet: the form holds the
 * list and the save decides what the product ends up pointing at, so a photo the
 * merchant removes before saving never reaches the product at all.
 *
 * A photo that was already on the product has an id and no storage key of its
 * own. It passes through untouched; only rows without an id are uploads, and
 * only those are previewed from a local object URL — the product's real URL
 * arrives with the next read.
 */
export function useEditMedia({
    productId,
    form,
    setMedia,
}: {
    productId: string
    form: EditForm
    setMedia: React.Dispatch<React.SetStateAction<MediaDraft[]>>
}) {
    const mediaBusy = useMemo(() => form.media.some((item) => item.status !== "ready"), [form.media])

    const addMedia = useCallback(
        async (file: File) => {
            const validation = validateUploadFile(file, { imagesOnly: true })

            if (validation !== null) {
                notifyError("Foto tidak dapat digunakan", validation)
                return
            }

            if (form.media.length >= MAX_PRODUCT_MEDIA) {
                notifyError("Batas foto tercapai", `Maksimal ${MAX_PRODUCT_MEDIA} foto per produk.`)
                return
            }

            const key = draftKey("med")
            // A local object URL so the tile shows the photo the moment it is
            // chosen, rather than an empty square for the length of the upload.
            const preview = URL.createObjectURL(file)

            setMedia((current) => [
                ...current,
                {
                    key,
                    object_key: "",
                    file_name: file.name,
                    mime_type: file.type,
                    file_size: file.size,
                    preview_url: preview,
                    alt_text: "",
                    is_primary: current.length === 0,
                    status: "uploading",
                },
            ])

            try {
                const target = await mediaApi.createProductMediaUploadUrl(productId, {
                    file_name: file.name,
                    mime_type: file.type,
                    file_size: file.size,
                })

                await putToStorage(target.upload_url, file, { headers: target.headers })

                setMedia((current) =>
                    current.map((item) =>
                        item.key === key ? { ...item, object_key: target.object_key, status: "ready" as const } : item
                    )
                )
            } catch (error) {
                // The bytes never arrived, so there is nothing in storage worth
                // keeping. Dropping the row leaves the form matching the product.
                URL.revokeObjectURL(preview)
                setMedia((current) => current.filter((item) => item.key !== key))
                notifyError(
                    "Foto gagal diunggah",
                    error instanceof ApiError ? error.detail : "Periksa koneksi lalu pilih foto kembali."
                )
            }
        },
        [form.media.length, productId, setMedia]
    )

    /**
     * The first photo is always the cover, so removing one hands the job to
     * whatever is now first. A photo that was already saved is not deleted here:
     * the plan removes it at save time, where a failure can be retried and
     * reported like any other.
     */
    const removeMedia = useCallback(
        (key: string) => {
            setMedia((current) => {
                const target = current.find((item) => item.key === key)

                if (target !== undefined && target.id === undefined && target.preview_url?.startsWith("blob:")) {
                    URL.revokeObjectURL(target.preview_url)
                }

                return current
                    .filter((item) => item.key !== key)
                    .map((item, index) => ({ ...item, is_primary: index === 0 }))
            })
        },
        [setMedia]
    )

    const setPrimaryMedia = useCallback(
        (key: string) => {
            setMedia((current) => current.map((item) => ({ ...item, is_primary: item.key === key })))
        },
        [setMedia]
    )

    const moveMedia = useCallback(
        (index: number, direction: -1 | 1) => {
            setMedia((current) => {
                const target = index + direction

                if (target < 0 || target >= current.length) {
                    return current
                }

                const next = [...current]
                const [item] = next.splice(index, 1)

                next.splice(target, 0, item)

                return next
            })
        },
        [setMedia]
    )

    const setAltText = useCallback(
        (key: string, alt_text: string) => {
            setMedia((current) => current.map((item) => (item.key === key ? { ...item, alt_text } : item)))
        },
        [setMedia]
    )

    /**
     * Signed previews expire. When a tile fails to render, the product's media is
     * re-read and the rows that are still there are given their fresh URLs — the
     * rows being uploaded are left alone, since the server has never seen them.
     */
    const refreshMedia = useCallback(async () => {
        const fresh = await mediaApi.fetchProductMedia(productId)

        setMedia((current) =>
            current.map((item) => {
                if (item.id === undefined) {
                    return item
                }

                const updated = fresh.find((entry) => entry.id === item.id)

                return updated === undefined ? item : { ...item, preview_url: updated.url }
            })
        )
    }, [productId, setMedia])

    return { mediaBusy, addMedia, removeMedia, setPrimaryMedia, moveMedia, setAltText, refreshMedia }
}
