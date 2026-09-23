import { useParams } from "react-router"

import { ErrorState } from "~/components/error-state"
import { getApiErrorMessage } from "~/lib/api-form"
import { CAP } from "~/modules/authorization"

import { ListSkeleton } from "../components/common/list-skeleton"
import { OutletScopedPage } from "../components/layout/outlet-scoped-page"
import { ServiceAreaForm } from "../components/service-area/service-area-form"
import { ServiceAreaReadOnly } from "../components/service-area/service-area-readonly"
import { useServiceArea } from "../services/merchant-operations.queries"
import { useOperationsPermissions } from "../utils/permissions"

export function OutletServiceAreaPage() {
    const { outlet: outletId } = useParams<{ outlet: string }>()
    const permissions = useOperationsPermissions(outletId)
    const query = useServiceArea(outletId, { enabled: permissions.canViewServiceArea })

    return (
        <OutletScopedPage
            outletId={outletId}
            title="Area Layanan"
            description="Tentukan radius atau wilayah yang dilayani outlet."
            capability={CAP.serviceAreaView}
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
                ) : permissions.canUpdateServiceArea ? (
                    <ServiceAreaForm outlet={outlet} area={query.data} />
                ) : (
                    <ServiceAreaReadOnly outlet={outlet} area={query.data} />
                )
            }
        </OutletScopedPage>
    )
}
