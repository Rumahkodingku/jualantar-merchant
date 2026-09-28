import { StoreIcon } from "lucide-react"

import { Text } from "~/components/ui/text"

import { CatalogEmptyState } from "../catalog-empty-state"
import { AvailabilityBadge } from "../outlets/availability-badge"
import { StatusBadge } from "../status-badge"
import type { OutletProductAssignment } from "../../types/catalog.types"

export function ProductOutletList({ assignments }: { assignments: OutletProductAssignment[] }) {
    if (assignments.length === 0) {
        return (
            <CatalogEmptyState
                icon={StoreIcon}
                title="Belum ada outlet"
                description="Produk ini belum terhubung ke outlet mana pun."
            />
        )
    }

    return (
        <ul className="flex flex-col gap-3">
            {assignments.map((assignment) => (
                <li key={assignment.id} className="flex flex-col gap-2 rounded-2xl border p-4">
                    <Text variant="base" weight="semibold">
                        {assignment.outlet?.name ?? assignment.outlet_id}
                    </Text>

                    <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={assignment.status} />
                        <AvailabilityBadge status={assignment.availability_status} />
                    </div>

                    {assignment.availability_status === "unavailable" &&
                    assignment.unavailable_reason !== null &&
                    assignment.unavailable_reason !== "" ? (
                        <Text variant="xs" className="text-muted-foreground">
                            {assignment.unavailable_reason}
                        </Text>
                    ) : null}
                </li>
            ))}
        </ul>
    )
}
