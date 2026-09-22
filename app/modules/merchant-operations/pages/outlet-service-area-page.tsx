import { useParams } from "react-router"

import { ErrorState } from "~/components/error-state"
import { getApiErrorMessage } from "~/lib/api-form"

import { ListSkeleton } from "../components/common/list-skeleton"
import { OutletScopedPage } from "../components/layout/outlet-scoped-page"
import { ServiceAreaForm } from "../components/service-area/service-area-form"
import { useServiceArea } from "../services/merchant-operations.queries"
import { useOperationsPermissions } from "../utils/permissions"

export function OutletServiceAreaPage() {
    const { outlet: outletId } = useParams<{ outlet: string }>()
    const permissions = useOperationsPermissions()
    const query = useServiceArea(outletId)

    return (
        <OutletScopedPage
            outletId={outletId}
            title="Area Layanan"
            description="Tentukan radius atau wilayah yang dilayani outlet."
        >
            {(outlet) =>
                query.isPending ? (
                    <ListSkeleton rows={3} className="h-20" />
                ) : query.isError ? (
                    <ErrorState
                        title="Gagal memuat area layanan"
                        description={getApiErrorMessage(query.error)}
                        onRetry={() => void query.refetch()}
                    />
                ) : (
                    <ServiceAreaForm outlet={outlet} area={query.data} canUpdate={permissions.canUpdateServiceArea} />
                )
            }
        </OutletScopedPage>
    )
}
