import { useCallback } from "react"

import { usePresignedUpload, type PresignedUploadController } from "~/hooks/use-presigned-upload"
import { validateUploadFile } from "~/lib/upload"

import * as mediaApi from "../services/media/media.api"
import type { MediaUploadTarget } from "../types"

export function useCatalogMediaUpload(productId: string): PresignedUploadController<MediaUploadTarget> {
    const createUpload = useCallback(
        (file: File) =>
            mediaApi.createProductMediaUploadUrl(productId, {
                file_name: file.name,
                mime_type: file.type,
                file_size: file.size,
            }),
        [productId]
    )

    const validate = useCallback((file: File) => validateUploadFile(file, { imagesOnly: true }), [])

    return usePresignedUpload<MediaUploadTarget>({ createUpload, validate })
}
