import { Text } from "~/components/ui/text"

import { StatusBadge } from "../common/status-badge"
import { merchantStatusPresentation } from "../../utils/merchant-status"
import type { MerchantStatus } from "../../types/merchant-operations.types"

function initials(name: string): string {
    const trimmed = name.trim()

    return trimmed === "" ? "M" : trimmed.slice(0, 1).toUpperCase()
}

export function SettingsHero({
    businessName,
    logoUrl,
    status,
    outletTotal,
}: {
    businessName: string
    logoUrl: string | null
    status: MerchantStatus
    outletTotal: number
}) {
    const presentation = merchantStatusPresentation(status)

    return (
        <section aria-label="Identitas merchant" className="flex items-center gap-3 rounded-2xl border bg-card p-4">
            {logoUrl !== null ? (
                <img
                    src={logoUrl}
                    alt={`Logo ${businessName}`}
                    className="size-14 shrink-0 rounded-xl border object-cover"
                />
            ) : (
                <span
                    aria-hidden="true"
                    className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-primary"
                >
                    {initials(businessName)}
                </span>
            )}

            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Text as="h2" variant="lg" weight="semibold" truncate className="tracking-tight">
                    {businessName}
                </Text>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <StatusBadge tone={presentation.tone} indicator={presentation.indicator}>
                        {presentation.label}
                    </StatusBadge>
                    <Text as="span" variant="xs" className="text-muted-foreground">
                        {outletTotal} outlet
                    </Text>
                </div>
            </div>
        </section>
    )
}
