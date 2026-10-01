import { InfoIcon, StoreIcon } from "lucide-react"

import { Text } from "~/components/ui/text"
import { cn } from "~/lib/utils"

import { CatalogEmptyState } from "../common/catalog-empty-state"
import { AvailabilityBadge } from "../outlets/availability-badge"
import { AvailabilityControl } from "../outlets/availability-control"
import { OutletAssignmentStatusControl } from "./outlet-assignment-status-control"
import type { OutletCatalogItem } from "../../types"

function OutletStateRow({
    label,
    description,
    children,
}: {
    label: string
    description: string
    children: React.ReactNode
}) {
    return (
        <div className="flex items-center justify-between gap-3 border-t p-4 first:border-t-0">
            <div className="flex min-w-0 flex-col">
                <Text variant="sm" weight="medium">
                    {label}
                </Text>
                <Text variant="xs" className="text-muted-foreground">
                    {description}
                </Text>
            </div>
            <div className="flex shrink-0 items-center gap-2">{children}</div>
        </div>
    )
}

/**
 * The outlet-scoped state of a product: availability and assignment status for
 * the outlet in scope only. Never lists other outlets' assignments — the
 * employee is already inside a single outlet's context.
 */
export function OutletProductOutletState({
    item,
    productId,
    outletId,
    outletLabel,
    canUpdateAvailability,
    canUpdateAssignmentStatus,
}: {
    item: OutletCatalogItem
    productId: string
    outletId: string
    outletLabel: string
    canUpdateAvailability: boolean
    canUpdateAssignmentStatus: boolean
}) {
    const assignment = item.assignment

    if (assignment === null) {
        return (
            <CatalogEmptyState
                icon={StoreIcon}
                title="Belum ditugaskan"
                description="Produk ini belum ditugaskan ke outlet ini."
            />
        )
    }

    const hasReason =
        assignment.availability_status === "unavailable" &&
        assignment.unavailable_reason !== null &&
        assignment.unavailable_reason !== ""

    return (
        <div className="mt-4 flex flex-col gap-3">
            <div className="mb-3">
                <div className="flex items-center gap-2">
                    <StoreIcon aria-hidden="true" className="size-4 text-muted-foreground" />
                    <Text as="h2" variant="base" weight="bold">
                        Status di Outlet
                    </Text>
                </div>
                <Text variant="xs" className="mt-1 text-muted-foreground">
                    Kondisi produk pada outlet yang sedang Anda buka.
                </Text>
            </div>

            <div className="overflow-hidden rounded-2xl border">
                <OutletStateRow label="Ketersediaan" description="Produk tersedia atau tidak di outlet ini">
                    {canUpdateAvailability ? (
                        <AvailabilityControl
                            productId={productId}
                            outletId={outletId}
                            availabilityStatus={assignment.availability_status}
                            disabled={assignment.status === "inactive"}
                            outletLabel={outletLabel}
                        />
                    ) : (
                        <AvailabilityBadge status={assignment.availability_status} />
                    )}
                </OutletStateRow>

                <OutletStateRow label="Status penugasan" description="Produk aktif atau nonaktif di outlet ini">
                    <OutletAssignmentStatusControl
                        productId={productId}
                        outletId={outletId}
                        status={assignment.status}
                        canEdit={canUpdateAssignmentStatus}
                        outletLabel={outletLabel}
                    />
                </OutletStateRow>

                {hasReason ? (
                    <div className="flex items-start gap-2 border-t bg-muted/40 px-4 py-3">
                        <InfoIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0">
                            <Text variant="xs" weight="medium">
                                Alasan tidak tersedia
                            </Text>
                            <Text variant="xs" className="mt-0.5 leading-relaxed text-muted-foreground">
                                {assignment.unavailable_reason}
                            </Text>
                        </div>
                    </div>
                ) : null}
            </div>

            <div className={cn("rounded-xl px-3 py-2.5", item.is_sellable ? "bg-emerald-500/10" : "bg-amber-500/10")}>
                <Text variant="xs" weight="medium">
                    {item.is_sellable
                        ? "Produk dapat dijual di outlet ini."
                        : "Produk belum dapat dijual di outlet ini (periksa status produk, kategori, varian, dan penugasan)."}
                </Text>
            </div>
        </div>
    )
}
