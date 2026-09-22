import { useCallback, useRef, useState } from "react"

import { ApiError, putToStorage } from "~/lib/api"

export type UploadState = "idle" | "selected" | "requesting" | "uploading" | "success" | "error"

export type PresignedTarget = {
    object_key: string
    upload_url: string
    headers: Record<string, string>
}

export type PresignedUploadController<TTarget extends PresignedTarget = PresignedTarget> = {
    file: File | null
    state: UploadState
    progress: number
    error: string | null
    select: (file: File) => void
    upload: () => Promise<TTarget | null>
    reset: () => void
    cancel: () => void
    isUploading: boolean
}

/**
 * Generic presigned-upload state machine: select a file, ask the API for a
 * presigned target, then push the bytes straight to object storage with
 * progress and cancellation.
 *
 * `createUpload` receives the selected file and must return the presigned
 * target; `validate` optionally rejects a file before any request is made.
 */
export function usePresignedUpload<TTarget extends PresignedTarget>({
    createUpload,
    validate,
}: {
    createUpload: (file: File) => Promise<TTarget>
    validate?: (file: File) => string | null
}): PresignedUploadController<TTarget> {
    const [file, setFile] = useState<File | null>(null)
    const [state, setState] = useState<UploadState>("idle")
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const abortRef = useRef<AbortController | null>(null)

    const select = useCallback(
        (next: File) => {
            const validation = validate?.(next) ?? null

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
        [validate]
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

    const upload = useCallback(async (): Promise<TTarget | null> => {
        if (file === null) {
            return null
        }

        setError(null)
        setState("requesting")

        try {
            const presigned = await createUpload(file)

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
    }, [createUpload, file])

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
