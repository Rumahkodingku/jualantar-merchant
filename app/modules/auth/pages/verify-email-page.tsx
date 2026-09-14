import { CheckCircle2Icon, XCircleIcon } from "lucide-react"
import { useEffect, useRef } from "react"
import { Link, useSearchParams } from "react-router"

import { AuthLayout } from "~/components/layouts/auth-layout"
import { SplashScreen } from "~/components/splash-screen"
import { Button } from "~/components/ui/button"

import { useVerifyEmail } from "../services/auth.mutations"

export function VerifyEmailPage() {
    const [searchParams] = useSearchParams()
    const verify = useVerifyEmail()
    const attempted = useRef(false)

    const id = searchParams.get("id") ?? ""
    const hash = searchParams.get("hash") ?? ""
    const expires = searchParams.get("expires") ?? undefined
    const signature = searchParams.get("signature") ?? undefined
    const missingParams = id === "" || hash === ""

    useEffect(() => {
        if (attempted.current || missingParams) {
            return
        }

        attempted.current = true
        verify.mutate({ id, hash, expires, signature })
    }, [id, hash, expires, signature, missingParams, verify])

    if (!missingParams && verify.isPending) {
        return <SplashScreen label="Memverifikasi email…" />
    }

    const failed = missingParams || verify.isError

    if (failed) {
        return (
            <AuthLayout
                title="Verifikasi gagal"
                description="Tautan verifikasi tidak valid atau sudah kedaluwarsa. Minta tautan baru untuk melanjutkan."
            >
                <div className="flex flex-col gap-6">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                        <XCircleIcon className="size-7" aria-hidden="true" />
                    </div>
                    <div className="flex w-full flex-col gap-2">
                        <Button render={<Link to="/merchant/check-email" />} size="lg" className="h-11 w-full">
                            Kirim ulang email verifikasi
                        </Button>
                        <Button render={<Link to="/login" />} variant="ghost" size="lg" className="h-11 w-full">
                            Kembali ke masuk
                        </Button>
                    </div>
                </div>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout
            title="Email berhasil diverifikasi"
            description="Akun Anda sudah aktif. Silakan masuk untuk melanjutkan pendaftaran usaha."
        >
            <div className="flex flex-col gap-6">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2Icon className="size-7" aria-hidden="true" />
                </div>
                <Button render={<Link to="/login" />} size="lg" className="h-11 w-full">
                    Masuk
                </Button>
            </div>
        </AuthLayout>
    )
}
