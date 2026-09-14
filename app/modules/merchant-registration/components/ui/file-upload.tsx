import { ImageIcon, RotateCcwIcon, UploadCloudIcon, XIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "~/components/ui/button"
import { Progress } from "~/components/ui/progress"
import { cn } from "~/lib/utils"

import { useRegistrationUpload, type UploadState } from "../../hooks/use-registration-upload"
import { formatFileSize, MAX_UPLOAD_SIZE_LABEL } from "../../schemas/upload.schema"
import type { PresignedUpload, UploadPurpose } from "../../types/merchant-registration.types"

export function FileUpload({
    purpose,
    imagesOnly = false,
    accept = "image/jpeg,image/png,image/webp,application/pdf",
    currentUrl,
    disabled = false,
    label = "Pilih file",
    hint,
    onUploaded,
    onStateChange,
}: {
    purpose: UploadPurpose
    imagesOnly?: boolean
    accept?: string
    currentUrl?: string | null
    disabled?: boolean
    label?: string
    hint?: string
    onUploaded?: (presigned: PresignedUpload, file: File) => Promise<void> | void
    onStateChange?: (state: UploadState) => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const { file, state, progress, error, select, upload, reset, cancel, isUploading } = useRegistrationUpload({
        purpose,
        imagesOnly,
    })
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        onStateChange?.(state)
    }, [state, onStateChange])

    useEffect(() => {
        if (file === null || !file.type.startsWith("image/")) {
            setPreviewUrl(null)
            return
        }

        const url = URL.createObjectURL(file)
        setPreviewUrl(url)

        return () => URL.revokeObjectURL(url)
    }, [file])

    async function handleUpload() {
        const presigned = await upload()

        if (presigned !== null && onUploaded !== undefined) {
            await onUploaded(presigned, file as File)
        }
    }

    function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
        const selected = event.target.files?.[0]

        if (selected !== undefined) {
            select(selected)
        }

        event.target.value = ""
    }

    const showCurrent = file === null && currentUrl !== undefined && currentUrl !== null

    return (
        <div className="flex flex-col gap-3">
            <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleSelect} />

            {showCurrent ? (
                <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
                    {imagesOnly ? (
                        <img src={currentUrl} alt="Berkas saat ini" className="size-12 rounded-lg object-cover" />
                    ) : (
                        <span className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <ImageIcon className="size-5" />
                        </span>
                    )}
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Berkas tersimpan</p>
                        <p className="truncate text-xs text-muted-foreground">{currentUrl}</p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={disabled}
                        onClick={() => inputRef.current?.click()}
                    >
                        Ganti
                    </Button>
                </div>
            ) : null}

            {file === null && !showCurrent ? (
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => inputRef.current?.click()}
                    className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center transition-colors outline-none",
                        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        state === "error" ? "border-destructive/50" : "border-border hover:bg-muted/50"
                    )}
                >
                    <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <UploadCloudIcon className="size-5" />
                    </span>
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-xs text-muted-foreground">
                        {hint ?? `JPG, PNG, WEBP, atau PDF. Maksimal ${MAX_UPLOAD_SIZE_LABEL}.`}
                    </span>
                </button>
            ) : null}

            {file === null && state === "error" && error !== null ? (
                <p className="text-xs text-destructive">{error}</p>
            ) : null}

            {file !== null ? (
                <div className="flex flex-col gap-3 rounded-xl border bg-card p-3">
                    <div className="flex items-center gap-3">
                        {previewUrl !== null ? (
                            <img src={previewUrl} alt="Pratinjau" className="size-12 rounded-lg object-cover" />
                        ) : (
                            <span className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <ImageIcon className="size-5" />
                            </span>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                        {state !== "success" ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Hapus file"
                                disabled={isUploading}
                                onClick={reset}
                            >
                                <XIcon />
                            </Button>
                        ) : null}
                    </div>

                    {state === "requesting" ? (
                        <p className="text-xs text-muted-foreground">Menyiapkan unggahan…</p>
                    ) : null}

                    {state === "uploading" ? (
                        <div className="flex flex-col gap-1.5">
                            <Progress value={progress} />
                            <p className="text-right text-xs text-muted-foreground">{progress}%</p>
                        </div>
                    ) : null}

                    {state === "success" ? (
                        <p className="text-xs font-medium text-emerald-600">File berhasil diunggah.</p>
                    ) : null}

                    {state === "error" && error !== null ? <p className="text-xs text-destructive">{error}</p> : null}

                    {state === "selected" || state === "error" ? (
                        <div className="flex gap-2">
                            <Button type="button" size="sm" disabled={disabled} onClick={() => void handleUpload()}>
                                {state === "error" ? (
                                    <>
                                        <RotateCcwIcon /> Coba lagi
                                    </>
                                ) : (
                                    "Unggah"
                                )}
                            </Button>
                        </div>
                    ) : null}

                    {state === "uploading" ? (
                        <Button type="button" variant="outline" size="sm" onClick={cancel}>
                            Batal
                        </Button>
                    ) : null}
                </div>
            ) : null}
        </div>
    )
}
