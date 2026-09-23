import { ArrowRightIcon } from "lucide-react"
import { Link } from "react-router"

import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Progress } from "~/components/ui/progress"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"
import { ApiError } from "~/lib/api"
import { useSession } from "~/modules/auth"
import { ForbiddenState, useAuthorization } from "~/modules/authorization"
import {
    AdminNote,
    REGISTRATION_BASE,
    rejectionNote,
    rejectionStageLabel,
    statusPresentationFor,
    stepProgress,
    useRegistration,
    type MerchantRegistration,
} from "~/modules/merchant-registration"

import { EmployeeHome } from "../components/employee-home"
import { MerchantHome } from "../components/merchant-home"

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

function RevisionCard({ registration }: { registration: MerchantRegistration }) {
    const note = rejectionNote(registration)
    const stageLabel = rejectionStageLabel(registration)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Perbaiki pendaftaran</CardTitle>
                <CardDescription>Pendaftaran Anda perlu diperbaiki sebelum dapat kami tinjau kembali.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {note !== null ? <AdminNote note={note} /> : null}
                {stageLabel !== null ? (
                    <Text variant="xs" className="text-muted-foreground">
                        Bagian yang perlu diperbaiki: {stageLabel}.
                    </Text>
                ) : null}
                <Button render={<Link to={REGISTRATION_BASE} />} size="lg" className="h-11 w-full text-sm">
                    Perbaiki sekarang
                    <ArrowRightIcon />
                </Button>
            </CardContent>
        </Card>
    )
}

function StatusCard({ registration }: { registration: MerchantRegistration }) {
    const presentation = statusPresentationFor(registration)
    const Icon = presentation.icon
    const note = rejectionNote(registration)

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
            <CardContent className="flex flex-col gap-4">
                {note !== null ? <AdminNote note={note} /> : null}
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
    const { isOwner, isLoading: isAuthLoading } = useAuthorization()
    const hasAssignments = (user?.outletAssignments.length ?? 0) > 0
    const isEmployee = !isOwner && hasAssignments
    // Registrasi merchant hanya milik owner; query dimatikan untuk karyawan
    // agar tidak menerima `merchant_registration_not_found` dan dikira harus
    // mendaftar lagi.
    const registration = useRegistration(isOwner)

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

            {isAuthLoading ? (
                <Card>
                    <CardContent className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
                        <Spinner className="size-4" />
                        <Text variant="sm">Memeriksa akses…</Text>
                    </CardContent>
                </Card>
            ) : isEmployee ? (
                <EmployeeHome />
            ) : !isOwner ? (
                <ForbiddenState
                    title="Belum ada akses outlet"
                    description="Akun Anda belum ditugaskan ke outlet mana pun. Hubungi pemilik merchant untuk mendapatkan akses."
                />
            ) : registration.isLoading ? (
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
            ) : registration.data === undefined ? null : registration.data.status === "draft" ? (
                <DraftCard registration={registration.data} />
            ) : registration.data.status === "revision_required" ? (
                <RevisionCard registration={registration.data} />
            ) : registration.data.status === "approved" ? (
                <MerchantHome registration={registration.data} />
            ) : (
                <StatusCard registration={registration.data} />
            )}
        </>
    )
}
