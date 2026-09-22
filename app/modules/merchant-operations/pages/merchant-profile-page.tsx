import { ErrorState } from "~/components/error-state"
import { getApiErrorMessage } from "~/lib/api-form"

import { ListSkeleton } from "../components/common/list-skeleton"
import { SettingsSubpageHeader } from "../components/layout/settings-subpage-header"
import { MerchantProfileForm } from "../components/profile/merchant-profile-form"
import { useOperationalProfile } from "../services/merchant-operations.queries"
import { useOperationsPermissions } from "../utils/permissions"
import { SETTINGS_PATHS } from "../utils/routes"

export function MerchantProfilePage() {
    const permissions = useOperationsPermissions()
    const query = useOperationalProfile()

    return (
        <div className="flex flex-1 flex-col gap-5">
            <SettingsSubpageHeader
                title="Profil Merchant"
                description="Identitas usaha yang dilihat customer."
                backTo={SETTINGS_PATHS.home}
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
