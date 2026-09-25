import { useCallback } from "react"

import { usePresignedUpload, type PresignedUploadController } from "~/hooks/use-presigned-upload"
import { validateUploadFile } from "~/lib/upload"

import { createOperationalUpload } from "../services/merchant-operations.api"
import type { OperationalUpload, OperationalUploadPurpose } from "../types/merchant-operations.types"

/** Presigned uploads for post-approval merchant assets (logo, outlet photos). */
export function useOperationalUpload({
    purpose,
    imagesOnly = false,
}: {
    purpose: OperationalUploadPurpose
    imagesOnly?: boolean
}): PresignedUploadController<OperationalUpload> {
    const requestUpload = useCallback(
        (file: File) =>
            createOperationalUpload({
                purpose,
                file_name: file.name,
                mime_type: file.type,
                file_size: file.size,
            }),
        [purpose]
    )

    const validate = useCallback((file: File) => validateUploadFile(file, { imagesOnly }), [imagesOnly])

    return usePresignedUpload<OperationalUpload>({ createUpload: requestUpload, validate })
}
