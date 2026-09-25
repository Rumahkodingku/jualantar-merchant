import { Badge } from "~/components/ui/badge"
import { Text } from "~/components/ui/text"

import { ReviewRow } from "./review-row"
import { operatingHoursSummary, serviceAreaLabel } from "../../utils/operating-hours-summary"
import type { MerchantRegistration } from "../../types/merchant-registration.types"

export function ReviewOutletCard({ outlet }: { outlet: MerchantRegistration["outlets"][number] }) {
    return (
        <div className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between gap-2">
                <Text as="h3" variant="sm" weight="semibold" truncate className="min-w-0">
                    {outlet.name}
                </Text>
                <Badge
                    variant="secondary"
                    className={
                        outlet.status === "active"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                            : undefined
                    }
                >
                    {outlet.status === "active" ? "Aktif" : "Nonaktif"}
                </Badge>
            </div>
            <div className="flex flex-col divide-y rounded-lg border">
                <ReviewRow
                    label="Alamat"
                    value={`${outlet.address}${outlet.geography?.village ? `, ${outlet.geography.village}` : ""}`}
                />
                <ReviewRow
                    label="Area layanan"
                    value={serviceAreaLabel(outlet.service_area_type, outlet.service_radius_km)}
                />
                {outlet.phone !== null ? <ReviewRow label="Telepon" value={outlet.phone} /> : null}
                <ReviewRow label="Jam operasional" value={operatingHoursSummary(outlet.operating_hours)} />
            </div>
            {outlet.photos_url.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                    {outlet.photos_url.map((url, index) =>
                        url !== null ? (
                            <img
                                key={url ?? index}
                                src={url}
                                alt={`Foto ${outlet.name}`}
                                className="size-12 rounded-lg border object-cover"
                            />
                        ) : null
                    )}
                </div>
            ) : null}
        </div>
    )
}
