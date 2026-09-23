import { ImageIcon, RotateCcwIcon, UploadCloudIcon, XIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import { Progress } from "~/components/ui/progress"
import { Text } from "~/components/ui/text"
import { MAX_UPLOAD_SIZE_LABEL } from "~/modules/merchant-registration"
import { cn } from "~/lib/utils"
import { useOperationalUpload } from "../../hooks/use-operational-upload"

const ACCEPT = "image/jpeg,image/png,image/webp"

export function MerchantLogoField({
    logoUrl,
    disabled = false,
    onUploaded,
    onBusyChange,
}: {
    logoUrl: string | null
    disabled?: boolean
    onUploaded: (objectKey: string) => void
    onBusyChange?: (busy: boolean) => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const { file, state, progress, error, select, upload, reset, cancel, isUploading } = useOperationalUpload({
        purpose: "logo",
        imagesOnly: true,
    })
    const [localPreview, setLocalPreview] = useState<string | null>(null)

    useEffect(() => {
        onBusyChange?.(isUploading)
    }, [isUploading, onBusyChange])

    useEffect(() => {
        if (file === null) {
            setLocalPreview(null)
            return
        }

        const url = URL.createObjectURL(file)
        setLocalPreview(url)

        return () => URL.revokeObjectURL(url)
    }, [file])

    async function handleUpload() {
        const result = await upload()

        if (result !== null) {
            onUploaded(result.object_key)
        }
    }

    function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
        const selected = event.target.files?.[0]

        if (selected !== undefined) {
            select(selected)
        }

        event.target.value = ""
    }

    const preview = localPreview ?? logoUrl

    return (
        <div className="flex flex-col items-center gap-3">
            <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={handleSelect} />

            <span
                className={cn(
                    "flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border bg-muted text-muted-foreground"
                )}
            >
                {preview !== null ? (
                    <img src={preview} alt="Logo merchant" className="size-full object-cover" />
                ) : (
                    <ImageIcon className="size-8" aria-hidden="true" />
                )}
            </span>

            {file === null ? (
                <>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={disabled}
                        onClick={() => inputRef.current?.click()}
                    >
                        <UploadCloudIcon /> {logoUrl === null ? "Unggah logo" : "Ubah logo"}
                    </Button>
                    {state === "error" && error !== null ? (
                        <Text variant="xs" className="text-destructive">
                            {error}
                        </Text>
                    ) : (
                        <Text variant="xs" className="text-muted-foreground">
                            JPG, PNG, atau WEBP. Maksimal {MAX_UPLOAD_SIZE_LABEL}.
                        </Text>
                    )}
                </>
            ) : (
                <div className="flex w-full flex-col gap-2 rounded-xl border bg-card p-3">
                    <div className="flex items-center gap-2">
                        <Text variant="sm" weight="medium" truncate className="min-w-0 flex-1">
                            {file.name}
                        </Text>
                        {state !== "success" ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Batalkan pilihan"
                                disabled={isUploading}
                                onClick={reset}
                            >
                                <XIcon />
                            </Button>
                        ) : null}
                    </div>

                    {state === "requesting" ? (
                        <Text variant="xs" className="text-muted-foreground">
                            Menyiapkan unggahan…
                        </Text>
                    ) : null}

                    {state === "uploading" ? (
                        <div className="flex flex-col gap-1.5">
                            <Progress value={progress} />
                            <Text variant="xs" align="right" className="text-muted-foreground">
                                {progress}%
                            </Text>
                        </div>
                    ) : null}

                    {state === "success" ? (
                        <Text variant="xs" weight="medium" className="text-emerald-600">
                            Logo berhasil diunggah.
                        </Text>
                    ) : null}

                    {state === "error" && error !== null ? (
                        <Text variant="xs" className="text-destructive">
                            {error}
                        </Text>
                    ) : null}

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
            )}
        </div>
    )
}
