import { useCallback, useRef, useState } from "react"

import { ApiError, putToStorage } from "~/lib/api"

import { validateUploadFile, type UploadValidationOptions } from "../schemas/upload.schema"
import { useCreateRegistrationUpload } from "../services/merchant-registration.mutations"
import type { PresignedUpload, UploadPurpose } from "../types/merchant-registration.types"

export type UploadState = "idle" | "selected" | "requesting" | "uploading" | "success" | "error"

export function useRegistrationUpload({
    purpose,
    imagesOnly = false,
}: {
    purpose: UploadPurpose
    imagesOnly?: boolean
}) {
    const createUpload = useCreateRegistrationUpload()
    const [file, setFile] = useState<File | null>(null)
    const [state, setState] = useState<UploadState>("idle")
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const abortRef = useRef<AbortController | null>(null)

    const select = useCallback(
        (next: File) => {
            const options: UploadValidationOptions = { imagesOnly }
            const validation = validateUploadFile(next, options)

            if (validation !== null) {
                setFile(null)
                setState("error")
                setError(validation)
                return
            }

            setFile(next)
            setProgress(0)
            setError(null)
            setState("selected")
        },
        [imagesOnly]
    )

    const reset = useCallback(() => {
        abortRef.current?.abort()
        abortRef.current = null
        setFile(null)
        setProgress(0)
        setError(null)
        setState("idle")
    }, [])

    const cancel = useCallback(() => {
        abortRef.current?.abort()
        abortRef.current = null
        setProgress(0)
        setState(file === null ? "idle" : "selected")
    }, [file])

    const upload = useCallback(async (): Promise<PresignedUpload | null> => {
        if (file === null) {
            return null
        }

        setError(null)
        setState("requesting")

        try {
            const presigned = await createUpload.mutateAsync({
                purpose,
                file_name: file.name,
                mime_type: file.type,
                file_size: file.size,
            })

            setState("uploading")
            const controller = new AbortController()
            abortRef.current = controller

            await putToStorage(presigned.upload_url, file, {
                headers: presigned.headers,
                onProgress: setProgress,
                signal: controller.signal,
            })

            setProgress(100)
            setState("success")
            abortRef.current = null

            return presigned
        } catch (uploadError) {
            abortRef.current = null

            const isCancelled =
                (uploadError as { code?: string }).code === "ERR_CANCELED" ||
                (uploadError instanceof DOMException && uploadError.name === "CanceledError")

            if (isCancelled) {
                setState("selected")
                return null
            }

            setState("error")
            setError(
                uploadError instanceof ApiError
                    ? uploadError.detail
                    : "Gagal mengunggah file. Periksa koneksi lalu coba lagi."
            )

            return null
        }
    }, [createUpload, file, purpose])

    return {
        file,
        state,
        progress,
        error,
        select,
        upload,
        reset,
        cancel,
        isUploading: state === "requesting" || state === "uploading",
    }
}
