import { ArrowRightIcon } from "lucide-react"
import { Link } from "react-router"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"
import { ApiError } from "~/lib/api"
import { useSession } from "~/modules/auth"
import {
    REGISTRATION_BASE,
    statusPresentationFor,
    stepProgress,
    useRegistration,
    type MerchantRegistration,
} from "~/modules/merchant-registration"

function StartCard() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Mulai pendaftaran usaha</CardTitle>
                <CardDescription>
                    Daftarkan usaha Anda agar dapat mulai menerima pesanan melalui JualAntar.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button render={<Link to={REGISTRATION_BASE} />} size="lg" className="h-11 w-full text-sm">
                    Mulai pendaftaran
                    <ArrowRightIcon />
                </Button>
            </CardContent>
        </Card>
    )
}

function DraftCard({ registration }: { registration: MerchantRegistration }) {
    const progress = stepProgress(registration)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Lanjutkan pendaftaran</CardTitle>
                <CardDescription>
                    {progress.completed} dari {progress.total} langkah selesai. Lengkapi data untuk mengaktifkan usaha
                    Anda.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <Progress value={progress.percentage} />
                <Button render={<Link to={REGISTRATION_BASE} />} size="lg" className="h-11 w-full text-sm">
                    Lanjutkan pendaftaran
                    <ArrowRightIcon />
                </Button>
            </CardContent>
        </Card>
    )
}

function StatusCard({ registration }: { registration: MerchantRegistration }) {
    const presentation = statusPresentationFor(registration)
    const Icon = presentation.icon

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <span
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${presentation.tone}`}
                    >
                        <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <CardTitle>{presentation.title}</CardTitle>
                </div>
                <CardDescription>{presentation.description}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button
                    render={<Link to={REGISTRATION_BASE} />}
                    variant="outline"
                    size="lg"
                    className="h-11 w-full text-sm"
                >
                    Lihat detail pendaftaran
                </Button>
            </CardContent>
        </Card>
    )
}

export function HomePage() {
    const { user } = useSession()
    const registration = useRegistration()

    const notFound =
        registration.error instanceof ApiError && registration.error.code === "merchant_registration_not_found"

    return (
        <>
            <section className="flex flex-col gap-1">
                <Text variant="sm" className="text-muted-foreground">
                    Selamat datang,
                </Text>
                <Text as="h1" variant="2xl" weight="semibold" truncate className="tracking-tight">
                    {user?.email ?? "Merchant"}
                </Text>
            </section>

            {registration.isLoading ? (
                <Card>
                    <CardContent className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                        <Spinner className="size-4" />
                        <Text variant="sm">Memuat status pendaftaran…</Text>
                    </CardContent>
                </Card>
            ) : notFound ? (
                <StartCard />
            ) : registration.isError ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Gagal memuat status</CardTitle>
                        <CardDescription>
                            {registration.error instanceof ApiError
                                ? registration.error.detail
                                : "Silakan coba beberapa saat lagi."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-11 w-full text-sm"
                            onClick={() => void registration.refetch()}
                        >
                            Coba lagi
                        </Button>
                    </CardContent>
                </Card>
            ) : registration.data === undefined ? null : registration.data.status === "draft" ||
              registration.data.status === "revision_required" ? (
                <DraftCard registration={registration.data} />
            ) : (
                <StatusCard registration={registration.data} />
            )}
        </>
    )
}
