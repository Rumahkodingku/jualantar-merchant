import { useParams } from "react-router"

import { ErrorState } from "~/components/error-state"
import { getApiErrorMessage } from "~/lib/api-form"
import { CAP } from "~/modules/authorization"

import { ListSkeleton } from "../components/common/list-skeleton"
import { OutletScopedPage } from "../components/layout/outlet-scoped-page"
import { AvailabilityPanel } from "../components/availability/availability-panel"
import { useAvailability, useServiceArea } from "../services/merchant-operations.queries"
import { outletServiceAreaSummary, serviceAreaSummary } from "../utils/service-area-summary"
import { useOperationsPermissions } from "../utils/permissions"

export function OutletAvailabilityPage() {
    const { outlet: outletId } = useParams<{ outlet: string }>()
    const permissions = useOperationsPermissions(outletId)
    const availability = useAvailability(outletId, { enabled: permissions.canViewAvailability })
    const serviceArea = useServiceArea(outletId, { enabled: permissions.canViewServiceArea })

    return (
        <OutletScopedPage
            outletId={outletId}
            title="Status Operasional"
            description="Status buka/tutup yang dihitung otomatis."
            capability={CAP.availabilityView}
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
