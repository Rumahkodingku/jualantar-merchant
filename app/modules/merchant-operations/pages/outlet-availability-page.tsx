import { useParams } from "react-router"

import { ErrorState } from "~/components/error-state"
import { getApiErrorMessage } from "~/lib/api-form"

import { ListSkeleton } from "../components/common/list-skeleton"
import { OutletScopedPage } from "../components/layout/outlet-scoped-page"
import { AvailabilityPanel } from "../components/availability/availability-panel"
import { useAvailability, useServiceArea } from "../services/merchant-operations.queries"
import { outletServiceAreaSummary, serviceAreaSummary } from "../utils/service-area-summary"

export function OutletAvailabilityPage() {
    const { outlet: outletId } = useParams<{ outlet: string }>()
    const availability = useAvailability(outletId)
    const serviceArea = useServiceArea(outletId)

    return (
        <OutletScopedPage
            outletId={outletId}
            title="Status Operasional"
            description="Status buka/tutup yang dihitung otomatis."
        >
            {(outlet) =>
                availability.isPending ? (
                    <ListSkeleton rows={2} className="h-32" />
                ) : availability.isError ? (
                    <ErrorState
                        title="Gagal memuat status operasional"
                        description={getApiErrorMessage(availability.error)}
                        onRetry={() => void availability.refetch()}
                    />
                ) : (
                    <AvailabilityPanel
                        availability={availability.data}
                        areaLabel={
                            serviceArea.data === undefined
                                ? outletServiceAreaSummary(outlet)
                                : serviceAreaSummary(serviceArea.data, outlet)
                        }
                    />
                )
            }
        </OutletScopedPage>
    )
}
