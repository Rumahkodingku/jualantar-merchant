import { ImageIcon, PlusIcon, ArrowUpIcon, ArrowDownIcon, StarIcon, Trash2Icon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"
import { MAX_UPLOAD_SIZE_LABEL } from "~/lib/upload"
import { MAX_PRODUCT_MEDIA, MEDIA_ACCEPT } from "../../utils/media"
import type { MediaDraft } from "../../types"

export function MediaEditPicker({
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
    onSetAltText: (key: string, altText: string) => void
    onPreviewError: () => void
}) {
    return (
        <div className="flex flex-col gap-3">
            <MediaFileInput onSelectFile={onSelectFile} />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {media.map((item, index) => (
                    <MediaEditTile
                        key={item.key}
                        item={item}
                        index={index}
                        isLast={index === media.length - 1}
                        onRemove={onRemove}
                        onSetPrimary={onSetPrimary}
                        onMove={onMove}

                        onPreviewError={onPreviewError}
                    />
                ))}

                {media.length < MAX_PRODUCT_MEDIA ? <AddMediaTile disabled={busy} /> : null}
            </div>

            <Text variant="xs" className="text-muted-foreground">
                Format JPG, PNG, atau WEBP, maksimal {MAX_UPLOAD_SIZE_LABEL} per foto dan {MAX_PRODUCT_MEDIA} foto per
                produk. Foto baru diunggah saat dipilih lalu disimpan bersama produk.
            </Text>
        </div>
    )
}

/** The hidden file input both pickers share, kept out of the tile grid. */
function MediaFileInput({ onSelectFile }: { onSelectFile: (file: File) => void }) {
    return (
        <label className="sr-only" htmlFor="product-media-input">
            Pilih foto produk
            <input
                id="product-media-input"
                type="file"
                accept={MEDIA_ACCEPT}
                className="hidden"
                onChange={(event) => {
                    const selected = event.target.files?.[0]

                    // Reset first so picking the same file twice in a row still
                    // fires a change event.
                    event.target.value = ""

                    if (selected !== undefined) {
                        onSelectFile(selected)
                    }
                }}
            />
        </label>
    )
}

function AddMediaTile({ disabled }: { disabled: boolean }) {
    return (
        <button
            type="button"
            onClick={() => document.getElementById("product-media-input")?.click()}
            disabled={disabled}
            aria-label="Tambah foto"
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
            <PlusIcon aria-hidden="true" className="size-5" />
            <Text variant="xs">Tambah</Text>
        </button>
    )
}

function MediaEditTile({
    item,
    index,
    isLast,
    onRemove,
    onSetPrimary,
    onMove,
    onPreviewError,
}: {
    item: MediaDraft
    index: number
    isLast: boolean
    onRemove: (key: string) => void
    onSetPrimary: (key: string) => void
    onMove: (index: number, direction: -1 | 1) => void
    onPreviewError: () => void
}) {
    const isUploading = item.status !== "ready"

    return (
        <div className="flex flex-col gap-1.5">
            <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
                {item.preview_url !== null ? (
                    <img
                        src={item.preview_url}
                        alt={item.alt_text}
                        loading="lazy"
                        className="size-full object-cover"
                        onError={onPreviewError}
                    />
                ) : (
                    <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
                        {isUploading ? (
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
                        disabled={item.is_primary || isUploading}
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
                        disabled={isLast}
                        onClick={() => onMove(index, 1)}
                    >
                        <ArrowDownIcon />
                    </Button>
                    <Button
                        type="button"
                        size="icon-xs"
                        variant="destructive"
                        aria-label={`Hapus foto ${index + 1}`}
                        disabled={isUploading}
                        onClick={() => onRemove(item.key)}
                    >
                        <Trash2Icon />
                    </Button>
                </div>
            </div>
        </div>
    )
}
