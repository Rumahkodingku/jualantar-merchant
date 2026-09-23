import { Text } from "~/components/ui/text"

import { serviceAreaSummary } from "../../utils/service-area-summary"
import type { OperationalOutlet, ServiceArea } from "../../types/merchant-operations.types"

/**
 * Read-only service area for users without the update capability. No edit
 * controls are rendered because the mutation is not available to them.
 */
export function ServiceAreaReadOnly({
    outlet,
    area,
}: {
    outlet: OperationalOutlet
    area: ServiceArea | null | undefined
}) {
    return (
        <div className="rounded-2xl border bg-card p-4">
            <Text variant="xs" className="text-muted-foreground">
                Area layanan saat ini
            </Text>
            <Text as="p" variant="base" weight="semibold" className="mt-0.5">
                {serviceAreaSummary(area, outlet)}
            </Text>
        </div>
    )
}
