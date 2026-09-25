import { useParams } from "react-router"

import { ErrorState } from "~/components/error-state"
import { getApiErrorMessage } from "~/lib/api-form"
import { CAP } from "~/modules/authorization"

import { ListSkeleton } from "~/components/list-skeleton"
import { OperatingHoursForm } from "../components/hours/operating-hours-form"
import { OperatingHoursReadOnly } from "../components/hours/operating-hours-readonly"
import { OutletScopedPage } from "../components/layout/outlet-scoped-page"
import { useOperatingHours } from "../services/merchant-operations.queries"
import { useOperationsPermissions } from "../utils/permissions"

export function OutletHoursPage() {
    const { outlet: outletId } = useParams<{ outlet: string }>()
    const permissions = useOperationsPermissions(outletId)
    const query = useOperatingHours(outletId, { enabled: permissions.canViewHours })

    return (
        <OutletScopedPage
            outletId={outletId}
            title="Jam Operasional"
            description="Aktifkan hari dan isi jam buka & tutup."
            capability={CAP.hoursView}
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
                ) : permissions.canUpdateHours ? (
                    <OperatingHoursForm outletId={outlet.id} schedule={query.data} />
                ) : (
                    <OperatingHoursReadOnly schedule={query.data} />
                )
            }
        </OutletScopedPage>
    )
}
