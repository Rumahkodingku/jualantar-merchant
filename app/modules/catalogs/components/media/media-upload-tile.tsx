import { useEffect, useRef, useState } from "react"
import { ImageUpIcon, PlusIcon, RotateCcwIcon, XIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Progress } from "~/components/ui/progress"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"

import { MAX_PRODUCT_MEDIA, MEDIA_ACCEPT, useCatalogMediaUpload } from "../../hooks/use-catalog-media-upload"
import { useAddMedia } from "../../services/media/media.mutations"
import { catalogErrorMessage } from "../../utils/api-error"
import { notifySuccess } from "~/lib/notify"
import type { MediaUploadTarget } from "../../types/catalog.types"

export function MediaUploadTile({ productId, mediaCount }: { productId: string; mediaCount: number }) {
    const inputRef = useRef<HTMLInputElement>(null)
    const autoStarted = useRef(false)
    const { file, state, progress, error, select, upload, reset, isUploading } = useCatalogMediaUpload(productId)
    const addMutation = useAddMedia(productId)
    const [target, setTarget] = useState<MediaUploadTarget | null>(null)
    const [registerError, setRegisterError] = useState<string | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const atLimit = mediaCount >= MAX_PRODUCT_MEDIA
    const isRegistering = addMutation.isPending
    const uploadFailed = state === "error" && error !== null

    useEffect(() => {
        if (file === null) {
            setPreviewUrl(null)
            return
        }

        const url = URL.createObjectURL(file)

        setPreviewUrl(url)

        return () => URL.revokeObjectURL(url)
    }, [file])

    function register(uploaded: MediaUploadTarget) {
        addMutation.mutate(
            { object_key: uploaded.object_key, is_primary: false },
            {
                onSuccess: () => {
                    autoStarted.current = false
                    reset()
                    setTarget(null)
                    setRegisterError(null)
                    notifySuccess("Foto ditambahkan")
                },
                onError: (failure) => {
                    setRegisterError(catalogErrorMessage(failure, "Gagal menyimpan foto"))
                },
            }
        )
    }

    async function runUpload() {
        setRegisterError(null)

        const result = await upload()

        if (result === null) {
            return
        }

        setTarget(result)
        register(result)
    }

    useEffect(() => {
        if (state !== "selected" || autoStarted.current) {
            return
        }

        autoStarted.current = true

        void runUpload()
    }, [state])

    function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
        const selected = event.target.files?.[0]

        event.target.value = ""

        if (selected === undefined) {
            return
        }

        autoStarted.current = false
        setTarget(null)
        setRegisterError(null)
        select(selected)
    }

    function handleDiscard() {
        autoStarted.current = false
        setTarget(null)
        setRegisterError(null)
        reset()
    }

    if (atLimit) {
        return (
            <div className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed p-2 text-center text-muted-foreground">
                <ImageUpIcon aria-hidden="true" className="size-5" />
                <Text variant="xs">Batas {MAX_PRODUCT_MEDIA} foto</Text>
            </div>
        )
    }

    const busy = isUploading || isRegistering

    return (
        <>
            <input ref={inputRef} type="file" accept={MEDIA_ACCEPT} className="hidden" onChange={handleSelect} />

            {file === null && !uploadFailed ? (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    aria-label="Tambah foto"
                    className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                    <PlusIcon aria-hidden="true" className="size-5" />
                    <Text variant="xs">Tambah</Text>
                </button>
            ) : null}

            {uploadFailed ? (
                <div className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-destructive/40 p-2 text-center">
                    <Text variant="xs" className="text-destructive">
                        {error}
                    </Text>
                    <Button type="button" size="xs" variant="outline" onClick={() => void runUpload()}>
                        <RotateCcwIcon /> Coba lagi
                    </Button>
                    <Button type="button" size="xs" variant="ghost" onClick={handleDiscard}>
                        Batal
                    </Button>
                </div>
            ) : null}

            {file !== null ? (
                <div className="relative flex aspect-square flex-col overflow-hidden rounded-xl border bg-muted">
                    {previewUrl !== null ? (
                        <img src={previewUrl} alt={file.name} className="size-full object-cover" />
                    ) : null}

                    {busy ? (
                        <div className="absolute inset-x-2 bottom-2 flex flex-col gap-1.5 rounded-lg bg-background/90 p-2 backdrop-blur-sm">
                            <Progress value={progress} />
                            <Text variant="xs" className="text-center">
                                {isRegistering ? (
                                    <>
                                        <Spinner /> Menyimpan…
                                    </>
                                ) : (
                                    `${progress}%`
                                )}
                            </Text>
                        </div>
                    ) : null}

                    {registerError !== null && !isRegistering ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/95 p-2 text-center">
                            <Text variant="xs" className="text-destructive">
                                {registerError}
                            </Text>
                            <Button
                                type="button"
                                size="xs"
                                variant="outline"
                                onClick={() => target !== null && register(target)}
                            >
                                <RotateCcwIcon /> Coba lagi
                            </Button>
                            <Button
                                type="button"
                                size="icon-xs"
                                variant="ghost"
                                aria-label="Batalkan foto"
                                onClick={handleDiscard}
                            >
                                <XIcon />
                            </Button>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </>
    )
}
