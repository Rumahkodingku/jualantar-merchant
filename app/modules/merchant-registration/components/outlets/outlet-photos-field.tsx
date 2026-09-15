import { ImageIcon, ImagePlusIcon, RotateCcwIcon, Trash2Icon, UploadCloudIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "~/components/ui/button"
import { Progress } from "~/components/ui/progress"
import { cn } from "~/lib/utils"

import { useRegistrationUpload, type UploadState } from "../../hooks/use-registration-upload"
import { MAX_UPLOAD_SIZE_LABEL } from "../../schemas/upload.schema"

const ACCEPT = "image/jpeg,image/png,image/webp"

type OutletPhotoItem = {
    key: string
    url: string | null
}

export function OutletPhotosField({
    photos,
    photoUrls,
    onChange,
    disabled = false,
    onStateChange,
}: {
    photos: string[]
    photoUrls: Record<string, string>
    onChange: (photos: string[]) => void
    disabled?: boolean
    onStateChange?: (state: UploadState) => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const localUrls = useRef<string[]>([])
    const { file, state, progress, error, select, upload, reset, cancel, isUploading } = useRegistrationUpload({
        purpose: "outlet",
        imagesOnly: true,
    })
    const [items, setItems] = useState<OutletPhotoItem[]>(() =>
        photos.map((key) => ({ key, url: photoUrls[key] ?? null }))
    )
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

    useEffect(
        () => () => {
            localUrls.current.forEach((url) => URL.revokeObjectURL(url))
        },
        []
    )

    function commit(next: OutletPhotoItem[]) {
        setItems(next)
        onChange(next.map((item) => item.key))
    }

    async function handleUpload() {
        const currentFile = file
        const presigned = await upload()

        if (presigned === null || currentFile === null) {
            return
        }

        const url = URL.createObjectURL(currentFile)
        localUrls.current.push(url)
        commit([...items, { key: presigned.object_key, url }])
        reset()
    }

    function handleRemove(key: string) {
        const removed = items.find((item) => item.key === key)

        if (removed?.url !== null && removed?.url !== undefined && localUrls.current.includes(removed.url)) {
            URL.revokeObjectURL(removed.url)
            localUrls.current = localUrls.current.filter((url) => url !== removed.url)
        }

        commit(items.filter((item) => item.key !== key))
    }

    function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
        const selected = event.target.files?.[0]

        if (selected !== undefined) {
            select(selected)
        }

        event.target.value = ""
    }

    return (
        <div className="flex flex-col gap-3">
            <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={handleSelect} />

            {items.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {items.map((item) => (
                        <div key={item.key} className="group relative aspect-square overflow-hidden rounded-xl border">
                            {item.url !== null ? (
                                <img src={item.url} alt="Foto outlet" className="size-full object-cover" />
                            ) : (
                                <span className="flex size-full items-center justify-center bg-muted text-muted-foreground">
                                    <ImageIcon className="size-5" />
                                </span>
                            )}
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon-sm"
                                aria-label="Hapus foto"
                                disabled={disabled}
                                className="absolute top-1 right-1 opacity-90"
                                onClick={() => handleRemove(item.key)}
                            >
                                <Trash2Icon />
                            </Button>
                        </div>
                    ))}
                </div>
            ) : null}

            {file === null ? (
                <button
                    type="button"
                    disabled={disabled || isUploading}
                    onClick={() => inputRef.current?.click()}
                    className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center transition-colors outline-none",
                        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        state === "error" ? "border-destructive/50" : "border-border hover:bg-muted/50"
                    )}
                >
                    <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        {items.length > 0 ? (
                            <ImagePlusIcon className="size-5" />
                        ) : (
                            <UploadCloudIcon className="size-5" />
                        )}
                    </span>
                    <span className="text-sm font-medium">
                        {items.length > 0 ? "Tambah foto lain" : "Unggah foto outlet"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        JPG, PNG, atau WEBP. Maksimal {MAX_UPLOAD_SIZE_LABEL} per foto.
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
                        </div>
                        {state !== "success" ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Batal"
                                disabled={isUploading}
                                onClick={reset}
                            >
                                <Trash2Icon />
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

                    {state === "error" && error !== null ? <p className="text-xs text-destructive">{error}</p> : null}

                    {state === "selected" || state === "error" ? (
                        <Button
                            type="button"
                            size="sm"
                            className="w-fit"
                            disabled={disabled}
                            onClick={() => void handleUpload()}
                        >
                            {state === "error" ? (
                                <>
                                    <RotateCcwIcon /> Coba lagi
                                </>
                            ) : (
                                "Unggah"
                            )}
                        </Button>
                    ) : null}

                    {state === "uploading" ? (
                        <Button type="button" variant="outline" size="sm" className="w-fit" onClick={cancel}>
                            Batal
                        </Button>
                    ) : null}
                </div>
            ) : null}
        </div>
    )
}
