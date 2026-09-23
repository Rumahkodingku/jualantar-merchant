import type { ReactNode } from "react"

import { ErrorState } from "~/components/error-state"
import { getApiErrorMessage } from "~/lib/api-form"
import { SubpageHeader } from "~/components/layouts/subpage-header"

import { ListSkeleton } from "../common/list-skeleton"
import { OutletCompactHeader } from "../outlets/outlet-compact-header"
import { useOperationalOutlet } from "../../services/merchant-operations.queries"
import { OUTLETS_PATHS, outletPath } from "../../utils/routes"
import type { OperationalOutlet } from "../../types/merchant-operations.types"

/**
 * Shared shell for the outlet-scoped settings screens: resolves the outlet,
 * renders the sub-page header and hands the outlet to the caller.
 */
export function OutletScopedPage({
    outletId,
    title,
    description,
    children,
}: {
    outletId: string | undefined
    title: string
    description?: string
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
                <ErrorState
                    title="Gagal memuat outlet"
                    description={getApiErrorMessage(query.error)}
                    onRetry={() => void query.refetch()}
                />
            ) : query.data === undefined ? null : (
                <>
                    <OutletCompactHeader outlet={query.data} />
                    {children(query.data)}
                </>
            )}
        </div>
    )
}
