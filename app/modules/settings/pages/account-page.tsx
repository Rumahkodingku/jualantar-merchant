import { useState } from "react"
import { LogOutIcon } from "lucide-react"

import { getApiErrorMessage } from "~/lib/api-form"
import { SubpageHeader } from "~/components/layouts/subpage-header"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"
import { useLogout, useSession } from "~/modules/auth"

import { SETTINGS_PATHS } from "../utils/paths"

export function AccountPage() {
    const logout = useLogout()
    const { user } = useSession()
    const [confirmOpen, setConfirmOpen] = useState(false)

    function logoutFromAccount() {
        setConfirmOpen(false)
        logout.mutate()
    }

    return (
        <div className="flex flex-1 flex-col gap-5">
            <SubpageHeader
                title="Akun"
                description="Lihat informasi akun dan keluar dari aplikasi."
                backTo={SETTINGS_PATHS.home}
            />

            <Card>
                <CardContent className="flex items-center gap-3 py-1">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                        {user?.email?.[0]?.toUpperCase() ?? "A"}
                    </span>
                    <div className="flex min-w-0 flex-col gap-0.5">
                        <Text variant="base" weight="semibold" className="break-words">
                            {user?.email ?? "Akun merchant"}
                        </Text>
                        <Text variant="sm" className="truncate text-muted-foreground">
                            {user?.roles?.join(", ") || "merchant"}
                        </Text>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle as="h2">Detail akun</CardTitle>
                    <CardDescription as="p">Informasi akun yang sedang digunakan.</CardDescription>
                </CardHeader>
                <CardContent>
                    <dl className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-4">
                            <Text as="dt" variant="sm" className="shrink-0 text-muted-foreground">
                                Email
                            </Text>
                            <Text as="dd" variant="sm" weight="medium" className="min-w-0 text-right break-words">
                                {user?.email ?? "Belum tersedia"}
                            </Text>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <Text as="dt" variant="sm" className="shrink-0 text-muted-foreground">
                                Peran
                            </Text>
                            <Text as="dd" variant="sm" weight="medium" className="min-w-0 text-right break-words">
                                {user?.roles?.join(", ") || "merchant"}
                            </Text>
                        </div>
                    </dl>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle as="h2">Keluar dari akun</CardTitle>
                    <CardDescription as="p">Anda perlu masuk kembali untuk mengelola usaha.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    {logout.isError ? (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {getApiErrorMessage(logout.error) ?? "Terjadi kesalahan saat keluar."}
                            </AlertDescription>
                        </Alert>
                    ) : null}

                    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                        <AlertDialogTrigger
                            render={
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="lg"
                                    className="h-11 w-full text-sm font-semibold"
                                    disabled={logout.isPending}
                                />
                            }
                        >
                            {logout.isPending ? (
                                <>
                                    <Spinner className="size-4" /> Keluar…
                                </>
                            ) : (
                                <>
                                    <LogOutIcon className="size-4" aria-hidden="true" /> Keluar dari akun
                                </>
                            )}
                        </AlertDialogTrigger>

                        <AlertDialogContent size="sm">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Keluar dari akun?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Sesi di perangkat ini akan dihentikan. Anda perlu masuk kembali untuk melanjutkan.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <Button type="button" variant="destructive" onClick={logoutFromAccount}>
                                    Ya, keluar
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
    )
}
