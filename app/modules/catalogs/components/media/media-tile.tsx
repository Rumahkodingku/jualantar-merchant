import { ImageIcon } from "lucide-react"

import { MediaThumbnail } from "../common/media-thumbnail"

/**
 * One product photo, with the "Utama" marker when it is the cover.
 *
 * The catalog shows the same photo in three places at three sizes — a strip on
 * the edit screen, a strip in the wizard's review, and a full grid on the
 * detail screen. Only the framing differs, so the two framings are named here
 * and every caller gets the same image, badge and missing-photo handling.
 */
export type MediaTileSize = "compact" | "full"

const FRAME: Record<MediaTileSize, { box: string; badge: string }> = {
    // The 16-unit strip used where photos are a reference, not the subject.
    compact: {
        box: "relative size-16 overflow-hidden rounded-lg border bg-muted",
        badge: "absolute top-0.5 left-0.5 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-primary-foreground",
    },
    // The square tile used in the detail gallery.
    full: {
        box: "relative aspect-square overflow-hidden rounded-xl border bg-muted",
        badge: "absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground",
    },
}

export function PrimaryBadge({ size, className }: { size: MediaTileSize; className?: string }) {
    return <span className={`${FRAME[size].badge} ${className ?? ""}`}>Utama</span>
}

export function MediaTile({
    src,
    alt,
    isPrimary = false,
    size = "compact",
    className,
}: {
    src: string | null
    alt: string
    isPrimary?: boolean
    size?: MediaTileSize
    className?: string
}) {
    return (
        <div className={`${FRAME[size].box} ${className ?? ""}`}>
            {size === "full" ? (
                <MediaThumbnail src={src} alt={alt} className="size-full" />
            ) : src === null ? null : (
                <img src={src} alt={alt} className="size-full object-cover" />
            )}

            {isPrimary ? <PrimaryBadge size={size} /> : null}
        </div>
    )
}

/**
 * A staged photo whose signed preview is not available yet. The draft only
 * carries a storage key, so there is a window where a tile has no image to
 * show and says so rather than rendering an empty square.
 */
export function MediaTilePlaceholder({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
    return (
        <div className={`${FRAME.compact.box} ${className ?? ""}`}>
            {src === null ? (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                    <ImageIcon aria-hidden="true" className="size-4" />
                </div>
            ) : (
                <img src={src} alt={alt} className="size-full object-cover" />
            )}
        </div>
    )
}
