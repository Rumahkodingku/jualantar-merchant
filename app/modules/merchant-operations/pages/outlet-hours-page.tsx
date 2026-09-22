import { useParams } from "react-router"

import { ErrorState } from "~/components/error-state"
import { getApiErrorMessage } from "~/lib/api-form"

import { ListSkeleton } from "../components/common/list-skeleton"
import { OperatingHoursForm } from "../components/hours/operating-hours-form"
import { OutletScopedPage } from "../components/layout/outlet-scoped-page"
import { useOperatingHours } from "../services/merchant-operations.queries"
import { useOperationsPermissions } from "../utils/permissions"

export function OutletHoursPage() {
    const { outlet: outletId } = useParams<{ outlet: string }>()
    const permissions = useOperationsPermissions()
    const query = useOperatingHours(outletId)

    return (
        <OutletScopedPage
            outletId={outletId}
            title="Jam Operasional"
            description="Aktifkan hari dan isi jam buka & tutup."
        >
            {(outlet) =>
                query.isPending ? (
                    <ListSkeleton rows={3} className="h-16" />
                ) : query.isError ? (
                    <ErrorState
                        title="Gagal memuat jam operasional"
                        description={getApiErrorMessage(query.error)}
                        onRetry={() => void query.refetch()}
                    />
                ) : (
                    <OperatingHoursForm
                        outletId={outlet.id}
                        schedule={query.data}
                        canUpdate={permissions.canUpdateHours}
                    />
                )
            }
        </OutletScopedPage>
    )
}
