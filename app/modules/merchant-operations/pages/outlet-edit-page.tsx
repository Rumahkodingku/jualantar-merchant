import { useNavigate, useParams } from "react-router"

import { ErrorState } from "~/components/error-state"
import { getApiErrorMessage } from "~/lib/api-form"
import { SubpageHeader } from "~/components/layouts/subpage-header"

import { ListSkeleton } from "../components/common/list-skeleton"
import { OutletForm } from "../components/outlets/outlet-form"
import { useOperationalOutlet } from "../services/merchant-operations.queries"
import { notifySuccess } from "../utils/notify"
import { OUTLETS_PATHS, outletPath } from "../utils/routes"

export function OutletEditPage() {
    const { outlet: outletId } = useParams<{ outlet: string }>()
    const navigate = useNavigate()
    const query = useOperationalOutlet(outletId)

    const backTo = outletId === undefined ? OUTLETS_PATHS.home : outletPath(outletId)

    return (
        <div className="flex flex-1 flex-col gap-5">
            <SubpageHeader title="Ubah Outlet" backTo={backTo} />

            {query.isPending ? (
                <ListSkeleton rows={3} className="h-24" />
            ) : query.isError ? (
                <ErrorState
                    title="Gagal memuat outlet"
                    description={getApiErrorMessage(query.error)}
                    onRetry={() => void query.refetch()}
                />
            ) : query.data === undefined ? null : (
                <OutletForm
                    key={query.data.id}
                    outlet={query.data}
                    onSaved={() => {
                        notifySuccess("Perubahan outlet disimpan.")
                        void navigate(backTo, { replace: true })
                    }}
                    onCancel={() => void navigate(backTo)}
                />
            )}
        </div>
    )
}
