import { useNavigate, useParams } from "react-router"

import { ErrorState } from "~/components/error-state"
import { getApiErrorMessage } from "~/lib/api-form"

import { ListSkeleton } from "../components/common/list-skeleton"
import { SettingsSubpageHeader } from "../components/layout/settings-subpage-header"
import { OutletForm } from "../components/outlets/outlet-form"
import { useOperationalOutlet } from "../services/merchant-operations.queries"
import { notifySuccess } from "../utils/notify"
import { SETTINGS_PATHS, outletPath } from "../utils/routes"

export function OutletEditPage() {
    const { outlet: outletId } = useParams<{ outlet: string }>()
    const navigate = useNavigate()
    const query = useOperationalOutlet(outletId)

    const backTo = outletId === undefined ? SETTINGS_PATHS.outlets : outletPath(outletId)

    return (
        <div className="flex flex-1 flex-col gap-5">
            <SettingsSubpageHeader title="Ubah Outlet" backTo={backTo} />

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
