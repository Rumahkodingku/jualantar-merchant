import { useState } from "react"
import { ChevronDownIcon, InfoIcon, MailIcon, MapPinIcon, MapPinOffIcon, PhoneIcon, StoreIcon } from "lucide-react"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible"
import { Text } from "~/components/ui/text"
import type { OperationalOutlet } from "~/modules/merchant-operations"

import { CatalogEmptyState } from "../common/catalog-empty-state"
import { AvailabilityBadge } from "../outlets/availability-badge"
import { StatusBadge } from "../common/status-badge"
import { outletPhotoUrl } from "../../utils/outlet-photo"
import { formatOutletLocation } from "../../utils/outlet-location"
import type { ProductOutletRow } from "../../types"

function OutletPhoto({
    outlet,
    outletId,
    alt,
    size = "md",
}: {
    outlet: OperationalOutlet | null
    outletId: string
    alt: string
    size?: "sm" | "md"
}) {
    const src = outletPhotoUrl(outlet)
    const [failed, setFailed] = useState(false)

    const sizeClass = size === "sm" ? "size-16" : "size-18"
    const iconClass = size === "sm" ? "size-5" : "size-6"

    if (src === null || failed) {
        return (
            <span
                aria-hidden="true"
                className={`flex ${sizeClass} shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-muted text-muted-foreground`}
            >
                <StoreIcon className={iconClass} />
            </span>
        )
    }

    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className={`${sizeClass} shrink-0 rounded-xl border object-cover`}
            key={`${outletId}-${src}`}
        />
    )
}

function OutletDetailRow({
    icon: Icon,
    label,
    children,
}: {
    icon: typeof MapPinIcon
    label: string
    children: React.ReactNode
}) {
    return (
        <div className="grid grid-cols-[20px_minmax(0,100px)_minmax(0,1fr)] items-start gap-2 border-t py-3 first:border-t-0">
            <Icon aria-hidden="true" className="mt-0.5 size-4 text-muted-foreground" />

            <Text variant="xs" className="text-muted-foreground">
                {label}
            </Text>

            <Text variant="xs" className="min-w-0 leading-relaxed">
                {children}
            </Text>
        </div>
    )
}

function ProductOutletCard({ row, defaultOpen }: { row: ProductOutletRow; defaultOpen: boolean }) {
    const { assignment, outlet } = row

    const location = formatOutletLocation(outlet)
    const name = outlet?.name ?? assignment.outlet?.name ?? assignment.outlet_id
    const hasPhone = outlet?.phone !== null && outlet?.phone !== undefined && outlet.phone !== ""
    const hasEmail = outlet?.email !== null && outlet?.email !== undefined && outlet.email !== ""
    const hasUnavailableReason =
        assignment.availability_status === "unavailable" &&
        assignment.unavailable_reason !== null &&
        assignment.unavailable_reason !== ""

    return (
        <li>
            <Collapsible defaultOpen={defaultOpen} className="overflow-hidden rounded-2xl border">
                <CollapsibleTrigger
                    type="button"
                    className="group flex w-full items-center gap-3 p-4 text-left transition-colors outline-none hover:bg-muted/30 focus-visible:bg-muted/60"
                >
                    <OutletPhoto outlet={outlet} outletId={assignment.outlet_id} alt={`Foto ${name}`} size="sm" />

                    <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-start justify-between gap-3">
                            <div className="min-w-0">
                                <Text variant="base" weight="bold" className="truncate">
                                    {name}
                                </Text>

                                <div className="mt-1 flex min-w-0 items-start gap-1.5">
                                    {location !== "" ? (
                                        <>
                                            <MapPinIcon
                                                aria-hidden="true"
                                                className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                                            />

                                            <Text variant="xs" className="truncate text-muted-foreground">
                                                {location}
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <MapPinOffIcon
                                                aria-hidden="true"
                                                className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                                            />

                                            <Text variant="xs" className="truncate text-muted-foreground">
                                                Lokasi tidak tersedia
                                            </Text>
                                        </>
                                    )}
                                </div>
                            </div>

                            <ChevronDownIcon
                                aria-hidden="true"
                                className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-panel-open:rotate-180"
                            />
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <StatusBadge status={assignment.status} />
                            <AvailabilityBadge status={assignment.availability_status} />
                        </div>
                    </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <div className="border-t bg-muted/10 px-4 pt-1 pb-3">
                        <OutletDetailRow icon={location !== "" ? MapPinIcon : MapPinOffIcon} label="Alamat Operasional">
                            {location !== "" ? location : "Rincian alamat outlet tidak tersedia."}
                        </OutletDetailRow>

                        {hasPhone ? (
                            <OutletDetailRow icon={PhoneIcon} label="Telepon Operasional">
                                {outlet.phone}
                            </OutletDetailRow>
                        ) : null}

                        {hasEmail ? (
                            <OutletDetailRow icon={MailIcon} label="Email Operasional">
                                {outlet.email}
                            </OutletDetailRow>
                        ) : null}

                        {hasUnavailableReason ? (
                            <div className="mt-2 flex items-start gap-2 rounded-xl bg-muted px-3 py-2.5">
                                <InfoIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                <div className="min-w-0">
                                    <Text variant="xs" weight="medium">
                                        Produk tidak tersedia
                                    </Text>

                                    <Text variant="xs" className="mt-0.5 leading-relaxed text-muted-foreground">
                                        {assignment.unavailable_reason}
                                    </Text>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </li>
    )
}

export function ProductOutletList({ rows }: { rows: ProductOutletRow[] }) {
    if (rows.length === 0) {
        return (
            <CatalogEmptyState
                icon={StoreIcon}
                title="Belum ada outlet"
                description="Produk ini belum terhubung ke outlet mana pun."
            />
        )
    }

    const isSingleOutlet = rows.length === 1

    return (
        <div className="mt-4">
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <StoreIcon aria-hidden="true" className="size-4 text-muted-foreground" />

                    <Text as="h2" variant="base" weight="bold">
                        Outlet yang terhubung
                    </Text>
                </div>

                <Text variant="xs" className="mt-1 text-muted-foreground">
                    Terdapat {rows.length} outlet yang menyediakan produk ini.
                </Text>
            </div>

            <ul className="flex flex-col gap-3">
                {rows.map((row) => (
                    <ProductOutletCard key={row.assignment.id} row={row} defaultOpen={isSingleOutlet} />
                ))}
            </ul>
        </div>
    )
}
