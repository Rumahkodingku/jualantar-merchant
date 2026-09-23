import { Text } from "~/components/ui/text"
import { DAY_KEYS, DAY_LABELS } from "~/modules/merchant-registration"
import type { OperatingHours } from "~/modules/merchant-registration"

/**
 * Read-only operating hours for users without the update capability. Renders the
 * schedule as plain data — no edit controls, since the mutation is not available.
 */
export function OperatingHoursReadOnly({ schedule }: { schedule: OperatingHours | null | undefined }) {
    return (
        <div className="flex flex-col divide-y overflow-hidden rounded-2xl border bg-card">
            {DAY_KEYS.map((day) => {
                const entry = schedule?.[day]
                const window =
                    entry?.is_open === true && typeof entry.open === "string" && typeof entry.close === "string"
                        ? `${entry.open} — ${entry.close}`
                        : null

                return (
                    <div key={day} className="flex items-center justify-between gap-3 px-4 py-3">
                        <Text variant="sm" weight="medium">
                            {DAY_LABELS[day]}
                        </Text>
                        <Text variant="sm" className={window === null ? "text-muted-foreground" : undefined}>
                            {window ?? "Tutup"}
                        </Text>
                    </div>
                )
            })}
        </div>
    )
}
