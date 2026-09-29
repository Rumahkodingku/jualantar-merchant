import { EditableSection } from "./editable-section"
import { MediaManager } from "../media/media-manager"
import { MediaStrip } from "../media/media-strip"
import type { ProductDetail } from "../../types"

/** The product's photos, and the controls to add, reorder or remove them. */
export function ProductMediaSection({
    product,
    isExpanded,
    isEditing,
    onToggle,
    onStartEdit,
    onStopEdit,
}: {
    product: ProductDetail
    isExpanded: boolean
    isEditing: boolean
    onToggle: () => void
    onStartEdit: () => void
    onStopEdit: () => void
}) {
    const media = product.media ?? []

    return (
        <EditableSection
            title="Media"
            summary={`${media.length} foto`}
            isExpanded={isExpanded}
            isEditing={isEditing}
            onToggle={onToggle}
            onStartEdit={onStartEdit}
            onStopEdit={onStopEdit}
            view={<MediaStrip media={media} />}
            editor={<MediaManager productId={product.id} media={media} />}
        />
    )
}
