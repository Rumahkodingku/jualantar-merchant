import { ErrorState } from "~/components/error-state"
import { getApiErrorMessage } from "~/lib/api-form"

import { SubpageHeader } from "~/components/layouts/subpage-header"

import { ListSkeleton } from "~/components/list-skeleton"
import { MerchantStatusActions } from "../components/status/merchant-status-actions"
import { MerchantStatusHero } from "../components/status/merchant-status-hero"
import {
    useActivateMerchant,
    useReactivateMerchant,
    useSuspendMerchant,
} from "../services/merchant-operations.mutations"
import { useOperationsSummary } from "../services/merchant-operations.queries"
import { notifyError, notifySuccess } from "~/lib/notify"
import { useOperationsPermissions } from "../utils/permissions"
import { SETTINGS_HOME_PATH } from "../utils/routes"

export function MerchantStatusPage() {
    const permissions = useOperationsPermissions()
    const query = useOperationsSummary()

    const activate = useActivateMerchant()
    const suspend = useSuspendMerchant()
    const reactivate = useReactivateMerchant()

    const isPending = activate.isPending || suspend.isPending || reactivate.isPending

    const run = (mutation: typeof activate, successMessage: string, failureMessage: string) => {
        mutation.mutate(undefined, {
            onSuccess: () => notifySuccess(successMessage),
            onError: (error) => notifyError(failureMessage, getApiErrorMessage(error)),
        })
    }

    return (
        <div className="flex flex-1 flex-col gap-5">
            <SubpageHeader
                title="Status Merchant"
                description="Status operasional merchant secara keseluruhan."
                backTo={SETTINGS_HOME_PATH}
            />

            {query.isPending ? (
                <ListSkeleton rows={2} className="h-32" />
            ) : query.isError ? (
                <ErrorState
                    title="Gagal memuat status"
                    description={getApiErrorMessage(query.error)}
                    onRetry={() => void query.refetch()}
                />
            ) : query.data === undefined ? null : (
                <>
                    <MerchantStatusHero status={query.data.merchant.status} />

                    <MerchantStatusActions
                        status={query.data.merchant.status}
                        canUpdate={permissions.canUpdateMerchantStatus}
                        isPending={isPending}
                        onActivate={() => run(activate, "Merchant diaktifkan.", "Gagal mengaktifkan merchant")}
                        onSuspend={() => run(suspend, "Merchant ditangguhkan.", "Gagal menangguhkan merchant")}
                        onReactivate={() =>
                            run(reactivate, "Merchant diaktifkan kembali.", "Gagal mengaktifkan merchant")
                        }
                    />

                    {!permissions.canUpdateMerchantStatus ? (
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            Hanya pemilik merchant yang dapat mengubah status merchant.
                        </p>
                    ) : null}
                </>
            )}
        </div>
    )
}
