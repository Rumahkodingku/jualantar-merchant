import { LogOutIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"
import { useLogout, useSession } from "~/modules/auth"
import { SubpageHeader } from "~/components/layouts/subpage-header"

import { SETTINGS_PATHS } from "../utils/paths"

export function AccountPage() {
    const logout = useLogout()
    const { user } = useSession()

    return (
        <div className="flex flex-1 flex-col gap-5">
            <SubpageHeader
                title="Akun"
                description="Informasi akun dan keluar dari aplikasi."
                backTo={SETTINGS_PATHS.home}
            />

            <section className="flex items-center gap-3">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                    {user?.email?.[0]?.toUpperCase() ?? "M"}
                </span>
                <div className="flex min-w-0 flex-col">
                    <Text as="h2" variant="xl" weight="semibold" truncate>
                        {user?.email ?? "Merchant"}
                    </Text>
                    <Text variant="sm" className="truncate text-muted-foreground">
                        {user?.roles?.join(", ") || "merchant"}
                    </Text>
                </div>
            </section>

            <Card>
                <CardHeader>
                    <CardTitle>Detail akun</CardTitle>
                    <CardDescription>Informasi akun merchant Anda.</CardDescription>
                </CardHeader>
                <CardContent>
                    <dl className="flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-3">
                            <Text as="dt" variant="sm" className="text-muted-foreground">
                                Email
                            </Text>
                            <Text as="dd" variant="sm" weight="medium" truncate>
                                {user?.email}
                            </Text>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <Text as="dt" variant="sm" className="text-muted-foreground">
                                Peran
                            </Text>
                            <Text as="dd" variant="sm" weight="medium">
                                {user?.roles?.join(", ") || "merchant"}
                            </Text>
                        </div>
                    </dl>
                </CardContent>
            </Card>

            <Button
                type="button"
                size="lg"
                variant="destructive"
                className="w-full"
                onClick={() => logout.mutate()}
                disabled={logout.isPending}
            >
                {logout.isPending ? (
                    <Spinner className="size-4" />
                ) : (
                    <LogOutIcon className="size-4" aria-hidden="true" />
                )}
                Keluar
            </Button>
        </div>
    )
}
