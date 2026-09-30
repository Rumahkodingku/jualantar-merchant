import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"

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
    reorderHint?: string
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
                    size="lg"
                    className="h-10 shrink-0"
                    disabled={!canReorder && !reorderMode}
                    onClick={onToggleReorder}
                    aria-pressed={reorderMode}
                >
                    {reorderMode ? "Selesai" : "Urutkan"}
                </Button>

                <Button type="button" size="lg" className="shrink-0" onClick={onAdd}>
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
