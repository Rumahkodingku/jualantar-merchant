import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Dialog, DialogContent } from "~/components/ui/dialog"
import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

import { ProductMediaThumbnail } from "./product-media-thumbnail"
import { sortByDisplayOrder } from "../../utils/media-order"
import type { ProductMedia } from "../../types"

export function ProductPhotoViewer({
    media,
    index,
    onIndexChange,
    open,
    onOpenChange,
}: {
    media: ProductMedia[]
    index: number
    onIndexChange: (index: number) => void
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const items = sortByDisplayOrder(media)
    const total = items.length
    const safeIndex = total === 0 ? 0 : Math.min(Math.max(index, 0), total - 1)
    const current = items[safeIndex]

    function goPrev() {
        if (total > 0) {
            onIndexChange((safeIndex - 1 + total) % total)
        }
    }

    function goNext() {
        if (total > 0) {
            onIndexChange((safeIndex + 1) % total)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="flex h-dvh max-w-none flex-col gap-0 rounded-none p-0 sm:max-w-none"
                onKeyDown={(event) => {
                    if (event.key === "ArrowLeft") {
                        event.preventDefault()
                        goPrev()
                    }

                    if (event.key === "ArrowRight") {
                        event.preventDefault()
                        goNext()
                    }
                }}
            >
                <div className="flex items-center justify-between gap-2 p-3 pr-12">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Foto sebelumnya"
                        onClick={goPrev}
                        disabled={total <= 1}
                    >
                        <ChevronLeftIcon />
                    </Button>

                    <Text variant="sm" weight="medium" className="tabular-nums">
                        {total === 0 ? "0 / 0" : `${safeIndex + 1} / ${total}`}
                    </Text>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Foto berikutnya"
                        onClick={goNext}
                        disabled={total <= 1}
                    >
                        <ChevronRightIcon />
                    </Button>
                </div>

                <div className="flex flex-1 items-center justify-center overflow-hidden bg-muted/40 px-3">
                    {current !== undefined ? (
                        <ProductMediaThumbnail
                            src={current.url}
                            alt={current.alt_text ?? ""}
                            className="max-h-full max-w-full object-contain"
                        />
                    ) : null}
                </div>

                {total > 1 ? (
                    <div className="no-scrollbar flex gap-2 overflow-x-auto p-3">
                        {items.map((item, itemIndex) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onIndexChange(itemIndex)}
                                aria-label={`Lihat foto ${itemIndex + 1}`}
                                aria-current={itemIndex === safeIndex}
                                className={cn(
                                    "size-14 shrink-0 overflow-hidden rounded-lg border bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                                    itemIndex === safeIndex ? "border-primary ring-2 ring-primary/40" : "opacity-60"
                                )}
                            >
                                <ProductMediaThumbnail src={item.url} alt={item.alt_text ?? ""} className="size-full" />
                            </button>
                        ))}
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    )
}
