import { useEffect, useState } from "react"

import { Text } from "~/components/ui/text"
import { StatusBadge } from "~/components/status-badge"
import { merchantStatusPresentation, type MerchantStatus } from "~/modules/merchant-operations"

function initials(name: string): string {
    const trimmed = name.trim()

    return trimmed === "" ? "U" : trimmed.slice(0, 1).toUpperCase()
}

const numberFormatter = new Intl.NumberFormat("id-ID")

export function SettingsHero({
    businessName,
    logoUrl,
    status,
    outletTotal,
    outletPending = false,
}: {
    businessName: string
    logoUrl: string | null
    status: MerchantStatus
    outletTotal: number | null
    outletPending?: boolean
}) {
    const presentation = merchantStatusPresentation(status)
    const [logoAvailable, setLogoAvailable] = useState(logoUrl !== null)

    useEffect(() => {
        setLogoAvailable(logoUrl !== null)
    }, [logoUrl])

    return (
        <section aria-label="Identitas usaha" className="flex items-center gap-4 rounded-2xl border bg-card p-4 sm:p-5">
            {logoUrl !== null && logoAvailable ? (
                <img
                    src={logoUrl}
                    alt={`Logo ${businessName}`}
                    width={56}
                    height={56}
                    className="size-14 shrink-0 rounded-xl border object-cover"
                    onError={() => setLogoAvailable(false)}
                />
            ) : (
                <span
                    aria-hidden="true"
                    className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-semibold text-primary"
                >
                    {initials(businessName)}
                </span>
            )}

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Text as="h2" variant="lg" weight="semibold" className="line-clamp-2 tracking-tight break-words">
                    {businessName}
                </Text>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <StatusBadge tone={presentation.tone} indicator={presentation.indicator}>
                        {presentation.label}
                    </StatusBadge>
                    <Text as="span" variant="xs" className="break-words text-muted-foreground">
                        {outletPending
                            ? "Memuat jumlah outlet…"
                            : outletTotal === null
                              ? "Jumlah outlet belum tersedia"
                              : `${numberFormatter.format(outletTotal)} outlet`}
                    </Text>
                </div>
            </div>
        </section>
    )
}
