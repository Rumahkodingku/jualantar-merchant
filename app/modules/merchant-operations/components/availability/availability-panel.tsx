import { Text } from "~/components/ui/text"

import { StatusHeroCard } from "../common/status-hero-card"
import { availabilityPresentation, availabilityReasonMessage } from "../../utils/availability-reason"
import { merchantStatusPresentation } from "../../utils/merchant-status"
import { outletStatusLabel } from "../../utils/outlet-status"
import type { OperationalAvailability } from "../../types/merchant-operations.types"

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <Text as="dt" variant="sm" className="text-muted-foreground">
                {label}
            </Text>
            <Text as="dd" variant="sm" weight="medium" align="right" className="min-w-0">
                {value}
            </Text>
        </div>
    )
}

export function AvailabilityPanel({
    availability,
    areaLabel,
}: {
    availability: OperationalAvailability
    areaLabel: string
}) {
    const presentation = availabilityPresentation(availability.status)
    const reason = availabilityReasonMessage(availability.reason)
    const schedule = availability.schedule
    const scheduleLabel = schedule === null ? "Tutup hari ini" : `${schedule.open} - ${schedule.close}`

    return (
        <StatusHeroCard
            indicator={availability.status === "open" ? "🟢" : "⚪"}
            title={presentation.label}
            description={reason ?? presentation.headline}
            tone={presentation.tone}
            badgeLabel="Status operasional"
        >
            <dl className="flex flex-col gap-3 border-t pt-4">
                <DetailRow label="Merchant" value={merchantStatusPresentation(availability.merchant_status).label} />
                <DetailRow label="Outlet" value={outletStatusLabel(availability.outlet_status)} />
                <DetailRow label="Jam operasional" value={scheduleLabel} />
                <DetailRow label="Area layanan" value={areaLabel} />
            </dl>

            <Text variant="xs" className="leading-relaxed text-muted-foreground">
                Status ini dihitung otomatis dari status merchant, status outlet, dan jam operasional — bukan saklar
                manual.
            </Text>
        </StatusHeroCard>
    )
}
