import { PencilIcon, PowerIcon, PowerOffIcon } from "lucide-react"
import { useState } from "react"
import { Link, useParams } from "react-router"

import { ErrorState } from "~/components/error-state"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"
import { getApiErrorMessage } from "~/lib/api-form"
import { ApiError } from "~/lib/api"
import { SubpageHeader } from "~/components/layouts/subpage-header"
import { authorizationErrorMessage, ForbiddenState } from "~/modules/authorization"

import { ListSkeleton } from "../components/common/list-skeleton"
import { OutletSectionNav } from "../components/outlets/outlet-section-nav"
import { StatusBadge } from "../components/common/status-badge"
import { useActivateOutlet, useDeactivateOutlet } from "../services/merchant-operations.mutations"
import { useOperationalOutlet } from "../services/merchant-operations.queries"
import { notifyError, notifySuccess } from "../utils/notify"
import { outletStatusDescription, outletStatusLabel } from "../utils/outlet-status"
import { outletServiceAreaSummary } from "../utils/service-area-summary"
import { useOperationsPermissions } from "../utils/permissions"
import { OUTLETS_PATHS, outletEditPath } from "../utils/routes"
import { formatDecimal } from "../utils/format"
import type { OperationalOutlet } from "../types/merchant-operations.types"

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <Text as="dt" variant="sm" className="shrink-0 text-muted-foreground">
                {label}
            </Text>
            <Text as="dd" variant="sm" weight="medium" align="right" className="min-w-0">
                {value}
            </Text>
        </div>
    )
}

function OutletStatusCard({ outlet, canUpdateStatus }: { outlet: OperationalOutlet; canUpdateStatus: boolean }) {
    const activate = useActivateOutlet(outlet.id)
    const deactivate = useDeactivateOutlet(outlet.id)
    const [confirmOpen, setConfirmOpen] = useState(false)

    const isPending = activate.isPending || deactivate.isPending
    const isActive = outlet.status === "active"

    function run(action: "activate" | "deactivate") {
        const mutation = action === "activate" ? activate : deactivate

        mutation.mutate(undefined, {
            onSuccess: () => notifySuccess(action === "activate" ? "Outlet diaktifkan." : "Outlet dinonaktifkan."),
            onError: (error) => notifyError("Gagal mengubah status outlet", authorizationErrorMessage(error)),
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Status outlet</CardTitle>
                <CardDescription>{outletStatusDescription(outlet.status)}</CardDescription>
            </CardHeader>

            {canUpdateStatus ? (
                <CardContent>
                    {isActive ? (
                        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                            <Button
                                type="button"
                                variant="destructive"
                                size="lg"
                                className="h-11 w-full text-sm font-semibold"
                                disabled={isPending}
                                onClick={() => setConfirmOpen(true)}
                            >
                                <PowerOffIcon /> Nonaktifkan outlet
                            </Button>

                            <AlertDialogContent size="sm">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Nonaktifkan outlet ini?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Outlet berhenti menerima pesanan sampai diaktifkan kembali. Merchant dan outlet
                                        lain tidak terpengaruh.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        disabled={isPending}
                                        onClick={() => {
                                            setConfirmOpen(false)
                                            run("deactivate")
                                        }}
                                    >
                                        {isPending ? (
                                            <>
                                                <Spinner /> Memproses…
                                            </>
                                        ) : (
                                            "Ya, nonaktifkan"
                                        )}
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    ) : (
                        <Button
                            type="button"
                            size="lg"
                            className="h-11 w-full text-sm font-semibold"
                            disabled={isPending}
                            onClick={() => run("activate")}
                        >
                            {isPending ? (
                                <>
                                    <Spinner /> Memproses…
                                </>
                            ) : (
                                <>
                                    <PowerIcon /> Aktifkan outlet
                                </>
                            )}
                        </Button>
                    )}
                </CardContent>
            ) : null}
        </Card>
    )
}

function OutletDetail({ outlet }: { outlet: OperationalOutlet }) {
    const permissions = useOperationsPermissions(outlet.id)
    const location = [
        outlet.geography?.village,
        outlet.geography?.district,
        outlet.geography?.regency,
        outlet.geography?.province,
    ]
        .filter((part): part is string => part !== null && part !== undefined && part !== "")
        .join(", ")

    return (
        <div className="flex flex-1 flex-col gap-5">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border bg-muted text-lg font-semibold text-muted-foreground">
                            {outlet.photos_url[0] !== null && outlet.photos_url[0] !== undefined ? (
                                <img
                                    src={outlet.photos_url[0]}
                                    alt={`Foto ${outlet.name}`}
                                    className="size-full object-cover"
                                />
                            ) : (
                                outlet.name.slice(0, 1).toUpperCase()
                            )}
                        </span>
                        <div className="flex min-w-0 flex-col gap-1">
                            <CardTitle className="truncate">{outlet.name}</CardTitle>
                            <StatusBadge tone={outlet.status === "active" ? "positive" : "neutral"}>
                                {outletStatusLabel(outlet.status)}
                            </StatusBadge>
                        </div>
                    </div>
                </CardHeader>

                {permissions.canUpdateOutlet ? (
                    <CardContent>
                        <Button
                            render={<Link to={outletEditPath(outlet.id)} />}
                            variant="outline"
                            size="lg"
                            className="h-11 w-full text-sm"
                        >
                            <PencilIcon /> Ubah data outlet
                        </Button>
                    </CardContent>
                ) : null}
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Informasi outlet</CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="flex flex-col gap-3">
                        <InfoRow label="Alamat" value={outlet.address} />
                        <InfoRow label="Wilayah" value={location === "" ? "-" : location} />
                        <InfoRow label="Kode pos" value={outlet.postal_code} />
                        <InfoRow label="Telepon" value={outlet.phone ?? "-"} />
                        <InfoRow label="Email" value={outlet.email ?? "-"} />
                        <InfoRow
                            label="Koordinat"
                            value={`${formatDecimal(outlet.latitude, 6)}, ${formatDecimal(outlet.longitude, 6)}`}
                        />
                        <InfoRow label="Area layanan" value={outletServiceAreaSummary(outlet)} />
                    </dl>
                </CardContent>
            </Card>

            <OutletStatusCard outlet={outlet} canUpdateStatus={permissions.canUpdateOutletStatus} />

            <OutletSectionNav
                outlet={outlet}
                canViewHours={permissions.canViewHours}
                canViewServiceArea={permissions.canViewServiceArea}
                canViewEmployees={permissions.canViewEmployees}
                canViewAvailability={permissions.canViewAvailability}
            />
        </div>
    )
}

export function OutletDetailPage() {
    const { outlet: outletId } = useParams<{ outlet: string }>()
    const query = useOperationalOutlet(outletId)

    return (
        <div className="flex flex-1 flex-col gap-5">
            <SubpageHeader title="Detail Outlet" backTo={OUTLETS_PATHS.home} />

            {query.isPending ? (
                <ListSkeleton rows={3} className="h-28" />
            ) : query.isError ? (
                query.error instanceof ApiError && query.error.isForbidden ? (
                    <ForbiddenState />
                ) : (
                    <ErrorState
                        title="Outlet tidak dapat diakses"
                        description={getApiErrorMessage(query.error)}
                        onRetry={() => void query.refetch()}
                    />
                )
            ) : query.data === undefined ? null : (
                <>
                    <OutletDetail outlet={query.data} />
                </>
            )}
        </div>
    )
}
