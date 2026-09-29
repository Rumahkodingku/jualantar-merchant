import { WizardStepShell } from "../../product-wizard/wizard-step-shell"
import { MediaEditPicker } from "../media-edit-picker"
import type { MediaDraft } from "../../../types"

/**
 * The photo step of an edit.
 *
 * A photo is uploaded the moment it is chosen rather than at save time — the
 * bytes go straight to storage and the form keeps only the key — so the list on
 * screen is what the product will look like once saved, and a photo removed
 * before saving leaves nothing behind.
 */
export function EditMediaStep({
    media,
    busy,
    onSelectFile,
    onRemove,
    onSetPrimary,
    onMove,
    onSetAltText,
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
        <WizardStepShell title="Foto Produk" description="Unggah foto, atur urutannya, dan pilih foto utama.">
            <MediaEditPicker
                media={media}
                busy={busy}
                onSelectFile={onSelectFile}
                onRemove={onRemove}
                onSetPrimary={onSetPrimary}
                onMove={onMove}
                onSetAltText={onSetAltText}
                onPreviewError={onPreviewError}
            />
        </WizardStepShell>
    )
}
