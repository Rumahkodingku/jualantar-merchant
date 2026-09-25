import { useRef } from "react"
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, StarIcon, Trash2Icon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import { MAX_UPLOAD_SIZE_LABEL, validateUploadFile } from "~/lib/upload"

import { notifyError } from "~/lib/notify"
import { MAX_PRODUCT_MEDIA, MEDIA_ACCEPT } from "../../hooks/use-catalog-media-upload"
import { draftKey } from "./utils"
import type { MediaDraft } from "./types"

export function MediaDraftPicker({
    media,
    onChange,
}: {
    media: MediaDraft[]
    onChange: (media: MediaDraft[]) => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)

    function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
        const selected = event.target.files?.[0]

        event.target.value = ""

        if (selected === undefined) {
            return
        }

        const validation = validateUploadFile(selected, { imagesOnly: true })

        if (validation !== null) {
            notifyError("Foto tidak dapat digunakan", validation)
            return
        }

        if (media.length >= MAX_PRODUCT_MEDIA) {
            notifyError("Batas foto tercapai", `Maksimal ${MAX_PRODUCT_MEDIA} foto per produk.`)
            return
        }

        onChange([
            ...media,
            {
                key: draftKey("med"),
                file: selected,
                previewUrl: URL.createObjectURL(selected),
                alt_text: "",
                is_primary: media.length === 0,
            },
        ])
    }

    function remove(key: string) {
        const target = media.find((item) => item.key === key)

        if (target !== undefined) {
            URL.revokeObjectURL(target.previewUrl)
        }

        onChange(media.filter((item) => item.key !== key))
    }

    function setPrimary(key: string) {
        onChange(media.map((item) => ({ ...item, is_primary: item.key === key })))
    }

    function move(index: number, direction: -1 | 1) {
        const next = [...media]
        const target = index + direction

        if (target < 0 || target >= next.length) {
            return
        }

        const [item] = next.splice(index, 1)

        next.splice(target, 0, item)
        onChange(next)
    }

    return (
        <div className="flex flex-col gap-3">
            <input ref={inputRef} type="file" accept={MEDIA_ACCEPT} className="hidden" onChange={handleSelect} />

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {media.map((item, index) => (
                    <div key={item.key} className="flex flex-col gap-1">
                        <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
                            <img src={item.previewUrl} alt={item.alt_text} className="size-full object-cover" />
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
                                    disabled={item.is_primary}
                                    onClick={() => setPrimary(item.key)}
                                >
                                    <StarIcon />
                                </Button>
                                <Button
                                    type="button"
                                    size="icon-xs"
                                    variant="secondary"
                                    aria-label={`Naikkan foto ${index + 1}`}
                                    disabled={index === 0}
                                    onClick={() => move(index, -1)}
                                >
                                    <ArrowUpIcon />
                                </Button>
                                <Button
                                    type="button"
                                    size="icon-xs"
                                    variant="secondary"
                                    aria-label={`Turunkan foto ${index + 1}`}
                                    disabled={index === media.length - 1}
                                    onClick={() => move(index, 1)}
                                >
                                    <ArrowDownIcon />
                                </Button>
                                <Button
                                    type="button"
                                    size="icon-xs"
                                    variant="destructive"
                                    aria-label={`Hapus foto ${index + 1}`}
                                    onClick={() => remove(item.key)}
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
                        aria-label="Tambah foto"
                        className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                        <PlusIcon aria-hidden="true" className="size-5" />
                        <Text variant="xs">Tambah</Text>
                    </button>
                ) : null}
            </div>

            <Text variant="xs" className="text-muted-foreground">
                Foto baru diunggah setelah produk dibuat. Format JPG, PNG, atau WEBP, maksimal {MAX_UPLOAD_SIZE_LABEL}{" "}
                per foto.
            </Text>
        </div>
    )
}
