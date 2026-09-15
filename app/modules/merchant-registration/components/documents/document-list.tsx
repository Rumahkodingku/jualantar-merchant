import { ExternalLinkIcon, FileTextIcon, Trash2Icon } from "lucide-react"
import { useState } from "react"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"

import { documentTypeLabel } from "../../schemas/document.schema"
import { formatFileSize } from "../../schemas/upload.schema"
import { useDeleteDocument } from "../../services/merchant-registration.mutations"
import type { MerchantDocument } from "../../types/merchant-registration.types"
import { getApiErrorMessage } from "../../utils/api-error"

export function DocumentList({ documents }: { documents: MerchantDocument[] }) {
    const remove = useDeleteDocument()
    const [confirmingId, setConfirmingId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    if (documents.length === 0) {
        return null
    }

    async function handleDelete(documentId: string) {
        setError(null)

        try {
            await remove.mutateAsync(documentId)
            setConfirmingId(null)
        } catch (deleteError) {
            setError(getApiErrorMessage(deleteError))
        }
    }

    return (
        <div className="flex flex-col gap-2">
            {documents.map((document) => (
                <div key={document.id} className="flex flex-col gap-2 rounded-xl border bg-card p-3">
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <FileTextIcon className="size-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <p className="truncate text-sm font-medium">{document.file_name}</p>
                                <Badge variant="secondary">{documentTypeLabel(document.document_type)}</Badge>
                            </div>
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
                        {confirmingId === document.id ? (
                            <>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    disabled={remove.isPending}
                                    onClick={() => void handleDelete(document.id)}
                                >
                                    {remove.isPending ? "Menghapus…" : "Ya, hapus"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={remove.isPending}
                                    onClick={() => setConfirmingId(null)}
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
                                onClick={() => setConfirmingId(document.id)}
                            >
                                <Trash2Icon /> Hapus
                            </Button>
                        )}
                    </div>
                </div>
            ))}

            {error !== null ? <p className="text-xs text-destructive">{error}</p> : null}
        </div>
    )
}
