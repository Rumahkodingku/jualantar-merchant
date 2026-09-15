import {
    CheckCircle2Icon,
    ExternalLinkIcon,
    FileTextIcon,
    ImageIcon,
    RotateCcwIcon,
    Trash2Icon,
    UploadCloudIcon,
    XIcon,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Progress } from "~/components/ui/progress"
import { cn } from "~/lib/utils"
import { useRegistrationUpload } from "../../hooks/use-registration-upload"
import { primaryDocumentType, type DocumentRequirement } from "../../schemas/document.schema"
import { formatFileSize, MAX_UPLOAD_SIZE_LABEL } from "../../schemas/upload.schema"
import { useAttachDocument, useDeleteDocument } from "../../services/merchant-registration.mutations"
import type { MerchantDocument } from "../../types/merchant-registration.types"
import { getApiErrorMessage } from "../../utils/api-error"

export function DocumentSlot({
    requirement,
    document,
}: {
    requirement: DocumentRequirement
    document: MerchantDocument | null
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    const uploader = useRegistrationUpload({ purpose: "document", imagesOnly: requirement.imagesOnly })
    const attach = useAttachDocument()
    const remove = useDeleteDocument()
    const [error, setError] = useState<string | null>(null)
    const [confirmingDelete, setConfirmingDelete] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        if (uploader.file === null || !uploader.file.type.startsWith("image/")) {
            setPreviewUrl(null)
            return
        }

        const url = URL.createObjectURL(uploader.file)
        setPreviewUrl(url)

        return () => URL.revokeObjectURL(url)
    }, [uploader.file])

    const busy = uploader.isUploading || attach.isPending || remove.isPending
    const filled = document !== null && uploader.file === null
    const actionLabel = requirement.actionLabel ?? "Unggah"
    const formatHint = requirement.imagesOnly
        ? `JPG, PNG, atau WEBP. Maksimal ${MAX_UPLOAD_SIZE_LABEL}.`
        : `JPG, PNG, WEBP, atau PDF. Maksimal ${MAX_UPLOAD_SIZE_LABEL}.`

    function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
        const selected = event.target.files?.[0]

        if (selected !== undefined) {
            uploader.select(selected)
        }

        event.target.value = ""
    }

    async function handleUpload() {
        setError(null)

        const file = uploader.file

        if (file === null) {
            return
        }

        const presigned = await uploader.upload()

        if (presigned === null) {
            return
        }

        try {
            await attach.mutateAsync({
                document_type: primaryDocumentType(requirement),
                object_key: presigned.object_key,
                file_name: file.name,
                mime_type: file.type,
                file_size: file.size,
            })
        } catch (attachError) {
            setError(getApiErrorMessage(attachError))
            return
        }

        uploader.reset()

        if (document !== null) {
            try {
                await remove.mutateAsync(document.id)
            } catch (deleteError) {
                setError(getApiErrorMessage(deleteError))
            }
        }
    }

    async function handleDelete() {
        if (document === null) {
            return
        }

        setError(null)

        try {
            await remove.mutateAsync(document.id)
            setConfirmingDelete(false)
        } catch (deleteError) {
            setError(getApiErrorMessage(deleteError))
        }
    }

    return (
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-3.5">
            <input
                ref={inputRef}
                type="file"
                accept={requirement.accept}
                capture={requirement.capture}
                className="hidden"
                onChange={handleSelect}
            />

            <div className="flex items-start gap-3">
                <span
                    className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-lg",
                        filled ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                    )}
                >
                    {filled ? (
                        <CheckCircle2Icon className="size-5" aria-hidden="true" />
                    ) : (
                        <FileTextIcon className="size-5" aria-hidden="true" />
                    )}
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-medium">{requirement.title}</p>
                        {!filled ? <Badge variant="outline">Opsional</Badge> : null}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{requirement.description}</p>
                </div>
            </div>

            {filled && document !== null ? (
                <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-2.5">
                        {document.mime_type.startsWith("image/") && document.url !== null ? (
                            <img
                                src={document.url}
                                alt={document.file_name}
                                className="size-10 shrink-0 rounded-lg object-cover"
                            />
                        ) : (
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <ImageIcon className="size-5" aria-hidden="true" />
                            </span>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{document.file_name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(document.file_size)}</p>
                        </div>
                        {document.url !== null ? (
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Buka dokumen"
                                render={<a href={document.url} target="_blank" rel="noreferrer noopener" />}
                            >
                                <ExternalLinkIcon />
                            </Button>
                        ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() => inputRef.current?.click()}
                        >
                            Ganti
                        </Button>

                        {confirmingDelete ? (
                            <>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    disabled={remove.isPending}
                                    onClick={() => void handleDelete()}
                                >
                                    {remove.isPending ? "Menghapus…" : "Ya, hapus"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={remove.isPending}
                                    onClick={() => setConfirmingDelete(false)}
                                >
                                    Batal
                                </Button>
                            </>
                        ) : (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                disabled={busy}
                                onClick={() => setConfirmingDelete(true)}
                            >
                                <Trash2Icon /> Hapus
                            </Button>
                        )}
                    </div>
                </div>
            ) : null}

            {!filled && uploader.file === null ? (
                <div className="flex flex-col gap-1.5">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={busy}
                        onClick={() => inputRef.current?.click()}
                    >
                        <UploadCloudIcon /> {actionLabel}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">{formatHint}</p>
                </div>
            ) : null}

            {!filled && uploader.file !== null ? (
                <div className="flex flex-col gap-2.5 rounded-lg border bg-muted/30 p-2.5">
                    <div className="flex items-center gap-3">
                        {previewUrl !== null ? (
                            <img
                                src={previewUrl}
                                alt="Pratinjau"
                                className="size-10 shrink-0 rounded-lg object-cover"
                            />
                        ) : (
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                <ImageIcon className="size-5" aria-hidden="true" />
                            </span>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{uploader.file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(uploader.file.size)}</p>
                        </div>
                        {uploader.state !== "success" ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Batalkan pilihan"
                                disabled={uploader.isUploading}
                                onClick={uploader.reset}
                            >
                                <XIcon />
                            </Button>
                        ) : null}
                    </div>

                    {uploader.state === "requesting" ? (
                        <p className="text-xs text-muted-foreground">Menyiapkan unggahan…</p>
                    ) : null}

                    {uploader.state === "uploading" ? (
                        <div className="flex flex-col gap-1.5">
                            <Progress value={uploader.progress} />
                            <p className="text-right text-xs text-muted-foreground">{uploader.progress}%</p>
                        </div>
                    ) : null}

                    {uploader.state === "selected" || uploader.state === "error" ? (
                        <Button type="button" size="sm" disabled={busy} onClick={() => void handleUpload()}>
                            {uploader.state === "error" ? (
                                <>
                                    <RotateCcwIcon /> Coba lagi
                                </>
                            ) : (
                                actionLabel
                            )}
                        </Button>
                    ) : null}

                    {uploader.state === "uploading" ? (
                        <Button type="button" variant="outline" size="sm" onClick={uploader.cancel}>
                            Batal
                        </Button>
                    ) : null}
                </div>
            ) : null}

            {uploader.error !== null ? <p className="text-xs text-destructive">{uploader.error}</p> : null}
            {error !== null ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
    )
}
