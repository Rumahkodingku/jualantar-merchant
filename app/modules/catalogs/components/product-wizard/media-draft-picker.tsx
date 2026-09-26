import { useRef } from "react"
import { ArrowDownIcon, ArrowUpIcon, ImageIcon, PlusIcon, StarIcon, Trash2Icon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"
import { MAX_UPLOAD_SIZE_LABEL } from "~/lib/upload"

import { MAX_PRODUCT_MEDIA, MEDIA_ACCEPT } from "../../hooks/use-catalog-media-upload"
import type { MediaDraft } from "./types"

export function MediaDraftPicker({
    media,
    busy,
    onSelectFile,
    onRemove,
    onSetPrimary,
    onMove,
    onPreviewError,
}: {
    media: MediaDraft[]
    busy: boolean
    onSelectFile: (file: File) => void
    onRemove: (key: string) => void
    onSetPrimary: (key: string) => void
    onMove: (index: number, direction: -1 | 1) => void
    onPreviewError: () => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)

    function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
        const selected = event.target.files?.[0]

        event.target.value = ""

        if (selected === undefined) {
            return
        }

        onSelectFile(selected)
    }

    return (
        <div className="flex flex-col gap-3">
            <input ref={inputRef} type="file" accept={MEDIA_ACCEPT} className="hidden" onChange={handleSelect} />

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {media.map((item, index) => (
                    <div key={item.key} className="flex flex-col gap-1">
                        <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
                            {item.status === "ready" && item.preview_url !== null ? (
                                <img
                                    src={item.preview_url}
                                    alt={item.alt_text}
                                    className="size-full object-cover"
                                    onError={onPreviewError}
                                />
                            ) : (
                                <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
                                    {item.status === "uploading" ? (
                                        <>
                                            <Spinner />
                                            <Text variant="xs">Mengunggah</Text>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon aria-hidden="true" className="size-5" />
                                            <Text variant="xs">Gagal</Text>
                                        </>
                                    )}
                                </div>
                            )}
                            {item.is_primary ? (
                                <span className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                                    <StarIcon aria-hidden="true" className="size-3" /> Utama
                                </span>
                            ) : null}
                            <div className="absolute inset-x-1 bottom-1 flex justify-center gap-1">
                                <Button
                                    type="button"
                                    size="icon-xs"
                                    variant="secondary"
                                    aria-label={`Foto utama ${index + 1}`}
                                    disabled={item.is_primary || item.status !== "ready"}
                                    onClick={() => onSetPrimary(item.key)}
                                >
                                    <StarIcon />
                                </Button>
                                <Button
                                    type="button"
                                    size="icon-xs"
                                    variant="secondary"
                                    aria-label={`Naikkan foto ${index + 1}`}
                                    disabled={index === 0}
                                    onClick={() => onMove(index, -1)}
                                >
                                    <ArrowUpIcon />
                                </Button>
                                <Button
                                    type="button"
                                    size="icon-xs"
                                    variant="secondary"
                                    aria-label={`Turunkan foto ${index + 1}`}
                                    disabled={index === media.length - 1}
                                    onClick={() => onMove(index, 1)}
                                >
                                    <ArrowDownIcon />
                                </Button>
                                <Button
                                    type="button"
                                    size="icon-xs"
                                    variant="destructive"
                                    aria-label={`Hapus foto ${index + 1}`}
                                    disabled={item.status === "uploading"}
                                    onClick={() => onRemove(item.key)}
                                >
                                    <Trash2Icon />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                {media.length < MAX_PRODUCT_MEDIA ? (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={busy}
                        aria-label="Tambah foto"
                        className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                    >
                        <PlusIcon aria-hidden="true" className="size-5" />
                        <Text variant="xs">Tambah</Text>
                    </button>
                ) : null}
            </div>

            <Text variant="xs" className="text-muted-foreground">
                Foto diunggah langsung saat dipilih, lalu disimpan bersama draft. Foto tidak lagi tersedia akan hilang
                setelah 7 hari. Format JPG, PNG, atau WEBP, maksimal {MAX_UPLOAD_SIZE_LABEL} per foto.
            </Text>
        </div>
    )
}
