import { useCallback } from "react"

import { usePresignedUpload, type PresignedUploadController } from "~/hooks/use-presigned-upload"
import { validateUploadFile } from "~/modules/merchant-registration"

import { catalogRepository } from "../services/catalog.repository"
import type { MediaUploadTarget } from "../types/catalog.types"

export const MAX_PRODUCT_MEDIA = 10

export const MEDIA_ACCEPT = "image/jpeg,image/png,image/webp"

export function useCatalogMediaUpload(productId: string): PresignedUploadController<MediaUploadTarget> {
    const createUpload = useCallback(
        (file: File) =>
            catalogRepository.media.createUploadUrl(productId, {
                file_name: file.name,
                mime_type: file.type,
                file_size: file.size,
            }),
        [productId]
    )

    const validate = useCallback((file: File) => validateUploadFile(file, { imagesOnly: true }), [])

    return usePresignedUpload<MediaUploadTarget>({ createUpload, validate })
}
