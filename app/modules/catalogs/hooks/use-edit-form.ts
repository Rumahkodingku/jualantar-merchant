import { useCallback, useState } from "react"

import type { EditForm, EditSnapshot } from "../types"

/**
 * The edit wizard's form, held only in the browser.
 *
 * The create wizard can afford a server draft because the product it is building
 * does not exist yet and the work is worth an hour. An edit starts from something
 * already saved, so there is nothing to resume — what is on screen is the whole
 * of the work, and the only thing standing between it and a lost afternoon is
 * the leave guard. The snapshot is kept beside it so the save can tell what
 * actually changed, and it never moves once taken: it describes the product as
 * it was when the merchant opened the screen.
 */
export function useEditForm({ form, snapshot }: { form: EditForm; snapshot: EditSnapshot }) {
    const [state, setState] = useState<EditForm>(form)
    const [stepIndex, setStepIndex] = useState(0)

    const patchInfo = useCallback((patch: Partial<EditForm["info"]>) => {
        setState((current) => ({ ...current, info: { ...current.info, ...patch } }))
    }, [])

    const setPriceRaw = useCallback((priceRaw: string) => {
        setState((current) => ({ ...current, priceRaw }))
    }, [])

    const setVariants = useCallback((variants: EditForm["variants"]) => {
        setState((current) => ({ ...current, variants }))
    }, [])

    const setGroups = useCallback((groups: EditForm["groups"]) => {
        setState((current) => ({ ...current, groups }))
    }, [])

    /**
     * A dispatch rather than a value, because the media step is the one place
     * that updates a list from inside an async callback: it has to say "add
     * this row, then fill it in" without re-reading a form that has moved on in
     * between.
     */
    const setMedia = useCallback((change: React.SetStateAction<EditForm["media"]>) => {
        setState((current) => ({ ...current, media: typeof change === "function" ? change(current.media) : change }))
    }, [])

    const setOutletIds = useCallback((outletIds: string[]) => {
        setState((current) => ({ ...current, outletIds }))
    }, [])

    /**
     * Whether the merchant has touched anything. Compared against the snapshot
     * rather than a flag, because "dirty" has to mean "the save would send
     * something" — otherwise walking through six steps and changing nothing would
     * still block the back button.
     */
    const isDirty = signature(state) !== signature(form)

    return {
        form: state,
        snapshot,
        stepIndex,
        setStepIndex,
        isDirty,
        patchInfo,
        setPriceRaw,
        setVariants,
        setGroups,
        setMedia,
        setOutletIds,
    }
}

function signature(form: EditForm): string {
    return JSON.stringify(form)
}
