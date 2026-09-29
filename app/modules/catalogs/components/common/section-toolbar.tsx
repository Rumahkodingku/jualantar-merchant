import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"

/**
 * The search / reorder / add row that sits above a catalogue list.
 *
 * Every list in this module is a set of rows the merchant can search, reorder
 * and add to, so the three controls are laid out once here. The reorder hint
 * and the "you are searching" note are mutually exclusive: while a search is
 * active, reordering is not offered at all, and the note says why.
 */
export function SectionToolbar({
    searchValue,
    searchPlaceholder,
    onSearchChange,
    reorderMode,
    canReorder,
    onToggleReorder,
    addLabel,
    addIcon,
    onAdd,
    reorderHint,
    searchBlocksReorderNote,
}: {
    searchValue: string
    searchPlaceholder: string
    onSearchChange: (value: string) => void
    reorderMode: boolean
    canReorder: boolean
    onToggleReorder: () => void
    addLabel: string
    addIcon: React.ReactNode
    onAdd: () => void
    /** Shown while reordering, when the search is not in the way. */
    reorderHint?: string
    /** Shown when a search is active and reordering is therefore unavailable. */
    searchBlocksReorderNote?: string
}) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <Input
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder={searchPlaceholder}
                    aria-label={searchPlaceholder}
                    className="h-10 flex-1"
                />

                <Button
                    type="button"
                    variant={reorderMode ? "secondary" : "outline"}
                    size="sm"
                    className="h-10 shrink-0"
                    disabled={!canReorder && !reorderMode}
                    onClick={onToggleReorder}
                    aria-pressed={reorderMode}
                >
                    {reorderMode ? "Selesai" : "Urutkan"}
                </Button>

                <Button type="button" size="sm" className="h-10 shrink-0" onClick={onAdd}>
                    {addIcon}
                    <span className="hidden sm:inline">{addLabel}</span>
                    <span className="sm:hidden">Tambah</span>
                </Button>
            </div>

            {searchBlocksReorderNote !== undefined && !canReorder ? (
                <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">{searchBlocksReorderNote}</p>
            ) : reorderMode && reorderHint !== undefined ? (
                <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">{reorderHint}</p>
            ) : null}
        </div>
    )
}
