import { ErrorState } from "~/components/error-state"
import { getApiErrorMessage } from "~/lib/api-form"

import { SubpageHeader } from "~/components/layouts/subpage-header"

import { ListSkeleton } from "~/components/list-skeleton"
import { MerchantProfileForm } from "../components/profile/merchant-profile-form"
import { useOperationalProfile } from "../services/merchant-operations.queries"
import { useOperationsPermissions } from "../utils/permissions"
import { SETTINGS_HOME_PATH } from "../utils/routes"

export function MerchantProfilePage() {
    const permissions = useOperationsPermissions()
    const query = useOperationalProfile()

    return (
        <div className="flex flex-1 flex-col gap-5">
            <SubpageHeader
                title="Profil Merchant"
                description="Identitas usaha yang dilihat customer."
                backTo={SETTINGS_HOME_PATH}
            />

            {query.isPending ? (
                <ListSkeleton rows={3} className="h-32" />
            ) : query.isError ? (
                <ErrorState
                    title="Gagal memuat profil"
                    description={getApiErrorMessage(query.error)}
                    onRetry={() => void query.refetch()}
                />
            ) : query.data === undefined ? null : (
                <MerchantProfileForm profile={query.data} canUpdate={permissions.canUpdateMerchantProfile} />
            )}
        </div>
    )
}
