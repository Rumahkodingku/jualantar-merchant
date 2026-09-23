import type { ReactNode } from "react"

import { ErrorState } from "~/components/error-state"
import { getApiErrorMessage } from "~/lib/api-form"
import { ApiError } from "~/lib/api"
import { SubpageHeader } from "~/components/layouts/subpage-header"
import { CAP, ForbiddenState, OutletCapabilityGuard, type OperationsCapability } from "~/modules/authorization"
import { ListSkeleton } from "../common/list-skeleton"
import { useOperationalOutlet } from "../../services/merchant-operations.queries"
import { OUTLETS_PATHS, outletPath } from "../../utils/routes"
import type { OperationalOutlet } from "../../types/merchant-operations.types"

export function OutletScopedPage({
    outletId,
    title,
    description,
    capability = CAP.outletsView,
    children,
}: {
    outletId: string | undefined
    title: string
    description?: string
    capability?: OperationsCapability
    children: (outlet: OperationalOutlet) => ReactNode
}) {
    const query = useOperationalOutlet(outletId)
    const backTo = outletId === undefined ? OUTLETS_PATHS.home : outletPath(outletId)

    return (
        <div className="flex flex-1 flex-col gap-5">
            <SubpageHeader title={title} description={description} backTo={backTo} />

            {outletId === undefined ? (
                <ErrorState title="Outlet tidak ditemukan" description="Pilih outlet terlebih dahulu." />
            ) : query.isPending ? (
                <ListSkeleton rows={2} />
            ) : query.isError ? (
                query.error instanceof ApiError && query.error.isForbidden ? (
                    <ForbiddenState />
                ) : (
                    <ErrorState
                        title="Gagal memuat outlet"
                        description={getApiErrorMessage(query.error)}
                        onRetry={() => void query.refetch()}
                    />
                )
            ) : query.data === undefined ? null : (
                <OutletCapabilityGuard outletId={outletId} capability={capability}>
                    {children(query.data)}
                </OutletCapabilityGuard>
            )}
        </div>
    )
}
