import { Text } from "~/components/ui/text"

/**
 * Displays a note from the JualAntar review team, used across the status screen
 * and the revision wizard.
 */
export function AdminNote({ note }: { note: string }) {
    return (
        <div className="w-full rounded-xl border bg-muted/40 px-4 py-3">
            <Text variant="xs" weight="medium" className="text-muted-foreground">
                Catatan dari tim JualAntar
            </Text>
            <Text variant="sm" className="mt-1 whitespace-pre-line">
                {note}
            </Text>
        </div>
    )
}
