import type { ReactNode } from "react"

import { Button } from "~/components/ui/button"

import { ReviewSection } from "../common/review-section"

/**
 * One editable part of a product, in the accordion the edit screen is built from.
 *
 * A section is read-only until the merchant asks to change it, and the read-only
 * form is a summary plus a way in. Two thirds of this screen follow that shape —
 * variants, customization, photos, outlets — so the button placement, the
 * `Selesai` exit and the "keep the section open while editing" rule live here
 * once rather than in each section.
 *
 * The "Ubah" affordance appears both in the header and at the foot of the open
 * body, which is how the screen has always read; both are kept.
 */
export function EditableSection({
    title,
    summary,
    isExpanded,
    isEditing,
    onToggle,
    onStartEdit,
    onStopEdit,
    view,
    editor,
}: {
    title: string
    summary: string
    isExpanded: boolean
    isEditing: boolean
    onToggle: () => void
    onStartEdit: () => void
    onStopEdit: () => void
    /** What the merchant sees before asking to change anything. */
    view: ReactNode
    /** What replaces it while editing. */
    editor: ReactNode
}) {
    const startButton = (
        <Button type="button" size="sm" variant="outline" onClick={onStartEdit}>
            Ubah
        </Button>
    )

    return (
        <ReviewSection
            title={title}
            summary={summary}
            expanded={isExpanded}
            onToggle={onToggle}
            headerAction={isExpanded && !isEditing ? startButton : undefined}
        >
            <div className="flex flex-col gap-3">
                {isExpanded && !isEditing ? <div className="flex justify-end">{startButton}</div> : null}

                {isEditing ? (
                    <>
                        {editor}
                        <Button type="button" size="sm" variant="outline" className="self-start" onClick={onStopEdit}>
                            Selesai
                        </Button>
                    </>
                ) : (
                    view
                )}
            </div>
        </ReviewSection>
    )
}
