import { Images, ImagesIcon } from "lucide-react"
import { Text } from "~/components/ui/text"
import { CatalogEmptyState } from "../common/catalog-empty-state"
import { ProductMediaThumbnail } from "../common/media-thumbnail"
import { sortByDisplayOrder } from "../../utils/media-order"
import type { ProductMedia } from "../../types"

export function ProductMediaGallery({ media, onOpen }: { media: ProductMedia[]; onOpen: (index: number) => void }) {
    const items = sortByDisplayOrder(media)

    if (items.length === 0) {
        return (
            <CatalogEmptyState
                icon={ImagesIcon}
                title="Tidak ada foto produk"
                description="Belum ada foto yang ditambahkan. Tambahkan foto pada halaman edit produk."
            />
        )
    }

    return (
        <div className="mt-4 flex flex-col gap-3">
            <div className="mb-3">
                <div className="flex items-center gap-2">
                    <Images aria-hidden="true" className="size-4 text-muted-foreground" />
                    <Text as="h2" variant="base" weight="bold">
                        Galeri Produk
                    </Text>
                </div>
                <Text variant="xs" className="mt-1 text-muted-foreground">
                    Terdapat {items.length} foto untuk produk ini.
                </Text>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {items.map((item, index) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onOpen(index)}
                        aria-label={`Buka foto ${index + 1}`}
                        className="relative aspect-square overflow-hidden rounded-xl border bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                        <ProductMediaThumbnail src={item.url} alt={item.alt_text ?? ""} className="size-full" />
                        {item.is_primary ? (
                            <span className="absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                                Utama
                            </span>
                        ) : null}
                    </button>
                ))}
            </div>
        </div>
    )
}
