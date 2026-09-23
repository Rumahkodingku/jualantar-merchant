import { NotebookPenIcon, StoreIcon } from "lucide-react"
import { Link } from "react-router"
import { ErrorState } from "~/components/error-state"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Skeleton } from "~/components/ui/skeleton"
import { Text } from "~/components/ui/text"
import { ApiError } from "~/lib/api"
import { getApiErrorMessage } from "~/lib/api-form"
import { useSession } from "~/modules/auth"
import { ForbiddenState } from "~/modules/authorization"
import {
    OUTLET_ROLE_LABEL,
    outletPath,
    outletStatusLabel,
    OUTLETS_PATHS,
    useOperationalOutlets,
} from "~/modules/merchant-operations"

export function EmployeeHome() {
    const { user } = useSession()
    const assignments = user?.outletAssignments ?? []
    const outletsQuery = useOperationalOutlets({ per_page: 50 })

    const roleFor = (outletId: string) => {
        const assignment = assignments.find((item) => item.outletId === outletId)

        return assignment === undefined ? null : OUTLET_ROLE_LABEL[assignment.role]
    }

    return (
        <div className="flex flex-col gap-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <StoreIcon className="size-5" aria-hidden="true" />
                        </span>
                        <div className="flex min-w-0 flex-col">
                            <CardTitle>Outlet saya</CardTitle>
                            <CardDescription>
                                {assignments.length === 0
                                    ? "Akun Anda belum ditugaskan ke outlet mana pun."
                                    : `${assignments.length} outlet ditugaskan ke akun Anda.`}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    {outletsQuery.isPending ? (
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-14 w-full rounded-xl" />
                            <Skeleton className="h-14 w-full rounded-xl" />
                        </div>
                    ) : outletsQuery.isError ? (
                        outletsQuery.error instanceof ApiError && outletsQuery.error.isForbidden ? (
                            <ForbiddenState description="Anda tidak memiliki izin untuk melihat daftar outlet. Hubungi pemilik merchant." />
                        ) : (
                            <ErrorState
                                title="Gagal memuat outlet"
                                description={getApiErrorMessage(outletsQuery.error)}
                                onRetry={() => void outletsQuery.refetch()}
                            />
                        )
                    ) : outletsQuery.data.data.length === 0 ? (
                        <Text variant="sm" className="text-muted-foreground">
                            Belum ada outlet yang dapat diakses. Hubungi pemilik merchant untuk penugasan outlet.
                        </Text>
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {outletsQuery.data.data.map((outlet) => (
                                <li key={outlet.id}>
                                    <Link
                                        to={outletPath(outlet.id)}
                                        className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/60"
                                    >
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-sm font-semibold text-accent-foreground">
                                            {outlet.name[0]?.toUpperCase() ?? "O"}
                                        </span>
                                        <span className="flex min-w-0 flex-1 flex-col text-left">
                                            <Text as="span" variant="sm" weight="medium" truncate>
                                                {outlet.name}
                                            </Text>
                                            <Text as="span" variant="xs" className="truncate text-muted-foreground">
                                                {[roleFor(outlet.id), outletStatusLabel(outlet.status)]
                                                    .filter((part) => part !== null)
                                                    .join(" • ")}
                                            </Text>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    <Button
                        render={<Link to={OUTLETS_PATHS.home} />}
                        variant="outline"
                        size="lg"
                        className="h-11 w-full text-sm"
                    >
                        Kelola outlet
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                            <NotebookPenIcon className="size-5" aria-hidden="true" />
                        </span>
                        <div className="flex min-w-0 flex-col">
                            <CardTitle>Pesanan</CardTitle>
                            <CardDescription>Lihat pesanan pelanggan di outlet Anda.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Button render={<Link to="/orders" />} size="lg" className="h-11 w-full text-sm">
                        Lihat pesanan
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
