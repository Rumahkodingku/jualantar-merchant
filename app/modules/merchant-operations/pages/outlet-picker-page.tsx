import { StoreIcon } from "lucide-react"
import { useEffect } from "react"
import { Link, useNavigate } from "react-router"

import { ErrorState } from "~/components/error-state"
import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import { getApiErrorMessage } from "~/lib/api-form"

import { EmptyState } from "../components/common/empty-state"
import { ListSkeleton } from "../components/common/list-skeleton"
import { SettingsSubpageHeader } from "../components/layout/settings-subpage-header"
import { OutletPicker } from "../components/outlets/outlet-picker"
import { useOperationalOutlets } from "../services/merchant-operations.queries"
import { OUTLET_SHORTCUTS, SETTINGS_PATHS, outletShortcutPath, type OutletShortcutKey } from "../utils/routes"

export function OutletPickerPage({ shortcut }: { shortcut: OutletShortcutKey }) {
    const navigate = useNavigate()
    const query = useOperationalOutlets({ per_page: 100 })
    const config = OUTLET_SHORTCUTS[shortcut]
    const outlets = query.data?.data ?? []
    const hasSingleOutlet = outlets.length === 1

    useEffect(() => {
        if (hasSingleOutlet) {
            void navigate(outletShortcutPath(outlets[0].id, shortcut), { replace: true })
        }
    }, [hasSingleOutlet, outlets, shortcut, navigate])

    return (
        <div className="flex flex-1 flex-col gap-5">
            <SettingsSubpageHeader title={config.title} description={config.description} backTo={SETTINGS_PATHS.home} />

            {query.isPending || hasSingleOutlet ? (
                <ListSkeleton rows={2} className="h-24" />
            ) : query.isError ? (
                <ErrorState
                    title={`Gagal memuat outlet`}
                    description={getApiErrorMessage(query.error)}
                    onRetry={() => void query.refetch()}
                />
            ) : outlets.length === 0 ? (
                <EmptyState
                    icon={StoreIcon}
                    title="Belum ada outlet"
                    description="Tambahkan outlet terlebih dahulu sebelum mengatur bagian ini."
                    action={
                        <Button render={<Link to={SETTINGS_PATHS.outletNew} />} size="lg" className="h-11">
                            Tambah outlet
                        </Button>
                    }
                />
            ) : (
                <>
                    <Text variant="xs" className="text-muted-foreground">
                        {config.placeholder}
                    </Text>
                    <OutletPicker
                        outlets={outlets}
                        onSelect={(outlet) => void navigate(outletShortcutPath(outlet.id, shortcut))}
                    />
                </>
            )}
        </div>
    )
}
