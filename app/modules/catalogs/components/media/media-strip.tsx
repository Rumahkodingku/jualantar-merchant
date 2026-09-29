import { Text } from "~/components/ui/text"

import { MediaTile } from "./media-tile"
import type { ProductMedia } from "../../types"

/**
 * Photos that are already saved, shown as a fixed-size strip.
 *
 * The edit screen and the wizard's review step both need to answer "what will
 * the merchant see?" without letting the photos take over the section, so both
 * read from this one.
 */
export function MediaStrip({ media, emptyLabel = "Belum ada foto." }: { media: ProductMedia[]; emptyLabel?: string }) {
    if (media.length === 0) {
        return (
            <Text variant="sm" className="text-muted-foreground">
                {emptyLabel}
            </Text>
        )
    }

    return (
        <div className="flex flex-wrap gap-2">
            {media.map((item) => (
                <MediaTile key={item.id} src={item.url} alt={item.alt_text ?? ""} isPrimary={item.is_primary} />
            ))}
        </div>
    )
}
