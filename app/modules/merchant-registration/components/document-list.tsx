import { FileTextIcon, ExternalLinkIcon } from "lucide-react"

import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"

import { documentTypeLabel } from "../schemas/document.schema"
import { formatFileSize } from "../schemas/upload.schema"
import type { MerchantDocument } from "../types/merchant-registration.types"

export function DocumentList({ documents }: { documents: MerchantDocument[] }) {
    if (documents.length === 0) {
        return (
            <p className="text-sm leading-relaxed text-muted-foreground">
                Belum ada dokumen. Dokumen bersifat opsional untuk saat ini.
            </p>
        )
    }

    return (
        <div className="flex flex-col gap-2">
            {documents.map((document) => (
                <div key={document.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <FileTextIcon className="size-5" />
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
            ))}
        </div>
    )
}
