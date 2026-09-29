import { useCallback, useState } from "react"

/**
 * The parts of a product the edit screen is divided into. The id doubles as the
 * key into the `isEditing` record, so a section's editing state is a lookup
 * rather than seven pieces of state that can drift apart.
 */
export const EDIT_SECTIONS = ["info", "price", "variant", "customization", "media", "outlet"] as const

export type SectionId = (typeof EDIT_SECTIONS)[number]

/**
 * Which section is open, and which ones are mid-edit.
 *
 * They are separate because opening a section must not put it into edit mode:
 * reading a product's variants should not look like changing them. Exactly one
 * section is open at a time, and opening one while another is being edited
 * leaves the edit alone — a half-entered change is the merchant's, not
 * something to discard because they scrolled.
 */
export function useProductEditSections() {
    const [expanded, setExpanded] = useState<SectionId>("info")
    const [editing, setEditing] = useState<Record<SectionId, boolean>>({
        info: true,
        price: false,
        variant: false,
        customization: false,
        media: false,
        outlet: false,
    })

    // Tapping the open section closes it and falls back to the first, so the
    // screen is never left with nothing showing.
    const toggle = useCallback((id: SectionId) => {
        setExpanded((current) => (current === id ? "info" : id))
    }, [])

    const startEdit = useCallback((id: SectionId) => {
        setExpanded(id)
        setEditing((current) => ({ ...current, [id]: true }))
    }, [])

    const stopEdit = useCallback((id: SectionId) => {
        setEditing((current) => ({ ...current, [id]: false }))
    }, [])

    return { expanded, editing, toggle, startEdit, stopEdit }
}
