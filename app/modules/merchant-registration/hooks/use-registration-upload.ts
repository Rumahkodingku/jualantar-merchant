import { useCallback } from "react"

import { usePresignedUpload, type UploadState } from "~/hooks/use-presigned-upload"

import { validateUploadFile, type UploadValidationOptions } from "~/lib/upload"
import { useCreateRegistrationUpload } from "../services/merchant-registration.mutations"
import type { PresignedUpload, UploadPurpose } from "../types/merchant-registration.types"

export type { UploadState }

export function useRegistrationUpload({
    purpose,
    imagesOnly = false,
}: {
    purpose: UploadPurpose
    imagesOnly?: boolean
}) {
    const createUpload = useCreateRegistrationUpload()

    const requestUpload = useCallback(
        (file: File) =>
            createUpload.mutateAsync({
                purpose,
                file_name: file.name,
                mime_type: file.type,
                file_size: file.size,
            }),
        [createUpload, purpose]
    )

    const options: UploadValidationOptions = { imagesOnly }
    const validate = useCallback((file: File) => validateUploadFile(file, options), [imagesOnly])

    return usePresignedUpload<PresignedUpload>({ createUpload: requestUpload, validate })
}
