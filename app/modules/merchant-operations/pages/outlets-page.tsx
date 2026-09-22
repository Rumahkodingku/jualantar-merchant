import { PlusIcon, StoreIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router"

import { ErrorState } from "~/components/error-state"
import { Button } from "~/components/ui/button"
import { Text } from "~/components/ui/text"
import { getApiErrorMessage } from "~/lib/api-form"
import { useDebouncedValue } from "~/hooks/use-debounced-value"

import { EmptyState } from "../components/common/empty-state"
import { ListSkeleton } from "../components/common/list-skeleton"
import { SettingsSubpageHeader } from "../components/layout/settings-subpage-header"
import { OutletFilters, type StatusFilter } from "../components/outlets/outlet-filters"
import { OutletList } from "../components/outlets/outlet-list"
import { useOperationalOutlets } from "../services/merchant-operations.queries"
import { useOperationsPermissions } from "../utils/permissions"
import { SETTINGS_PATHS } from "../utils/routes"
import type { OperationalOutletListParams } from "../types/merchant-operations.types"

const PAGE_SIZE = 10

const STATUS_FILTERS: StatusFilter[] = ["all", "active", "inactive"]

function toStatusFilter(value: string | null): StatusFilter {
    return STATUS_FILTERS.includes(value as StatusFilter) ? (value as StatusFilter) : "all"
}

export function OutletsPage() {
    const permissions = useOperationsPermissions()
    const [searchParams, setSearchParams] = useSearchParams()

    const status = toStatusFilter(searchParams.get("status"))
    const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1)

    const [searchInput, setSearchInput] = useState(() => searchParams.get("search") ?? "")
    const debouncedSearch = useDebouncedValue(searchInput, 400)

    useEffect(() => {
        const current = searchParams.get("search") ?? ""

        if (current === debouncedSearch) {
            return
        }

        const next = new URLSearchParams(searchParams)

        if (debouncedSearch === "") {
            next.delete("search")
        } else {
            next.set("search", debouncedSearch)
        }

        next.delete("page")
        setSearchParams(next, { replace: true })
    }, [debouncedSearch, searchParams, setSearchParams])

    function updateParams(patch: Record<string, string | null>) {
        const next = new URLSearchParams(searchParams)

        for (const [key, value] of Object.entries(patch)) {
            if (value === null) {
                next.delete(key)
            } else {
                next.set(key, value)
            }
        }

        setSearchParams(next, { replace: true })
    }

    const params: OperationalOutletListParams = {
        search: searchParams.get("search") ?? undefined,
        status: status === "all" ? undefined : status,
        page,
        per_page: PAGE_SIZE,
    }

    const query = useOperationalOutlets(params)
    const meta = query.data?.meta
    const hasFilter = (searchParams.get("search") ?? "") !== "" || status !== "all"

    return (
        <div className="flex flex-1 flex-col gap-5">
            <SettingsSubpageHeader
                title="Outlet"
                description="Kelola outlet dan statusnya."
                backTo={SETTINGS_PATHS.home}
            />

            <OutletFilters
                search={searchInput}
                onSearchChange={setSearchInput}
                status={status}
                onStatusChange={(next) => updateParams({ status: next === "all" ? null : next, page: null })}
            />

            {query.isPending ? (
                <ListSkeleton rows={3} />
            ) : query.isError ? (
                <ErrorState
                    title="Gagal memuat outlet"
                    description={getApiErrorMessage(query.error)}
                    onRetry={() => void query.refetch()}
                />
            ) : query.data.data.length === 0 ? (
                <EmptyState
                    icon={StoreIcon}
                    title={hasFilter ? "Tidak ada outlet yang cocok" : "Belum ada outlet"}
                    description={
                        hasFilter
                            ? "Coba ubah kata kunci atau filter status."
                            : "Tambahkan outlet agar merchant Anda dapat menerima pesanan."
                    }
                    action={
                        permissions.canCreateOutlet && !hasFilter ? (
                            <Button render={<Link to={SETTINGS_PATHS.outletNew} />} size="lg" className="h-11">
                                <PlusIcon /> Tambah outlet
                            </Button>
                        ) : undefined
                    }
                />
            ) : (
                <>
                    <Text variant="xs" className="text-muted-foreground">
                        {meta?.total ?? query.data.data.length} outlet
                        {hasFilter ? " sesuai filter" : ""}
                    </Text>

                    <OutletList outlets={query.data.data} />

                    {meta !== undefined && meta.last_page > 1 ? (
                        <div className="flex items-center justify-between gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={meta.current_page <= 1}
                                onClick={() => updateParams({ page: String(meta.current_page - 1) })}
                            >
                                Sebelumnya
                            </Button>
                            <Text variant="xs" className="text-muted-foreground">
                                Halaman {meta.current_page} dari {meta.last_page}
                            </Text>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={meta.current_page >= meta.last_page}
                                onClick={() => updateParams({ page: String(meta.current_page + 1) })}
                            >
                                Berikutnya
                            </Button>
                        </div>
                    ) : null}
                </>
            )}

            {permissions.canCreateOutlet && query.data !== undefined && query.data.data.length > 0 ? (
                <Button render={<Link to={SETTINGS_PATHS.outletNew} />} size="lg" className="h-11 w-full">
                    <PlusIcon /> Tambah outlet
                </Button>
            ) : null}
        </div>
    )
}
