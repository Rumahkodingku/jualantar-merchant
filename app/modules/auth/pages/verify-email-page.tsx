import { CheckCircle2Icon, XCircleIcon } from "lucide-react"
import { useEffect, useRef } from "react"
import { Link, useSearchParams } from "react-router"

import { Brand } from "~/components/brand"
import { FullScreenLoader } from "~/components/full-screen-loader"
import { MobileScreen } from "~/components/layouts/mobile-screen"
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
        return <FullScreenLoader label="Memverifikasi email…" />
    }

    const failed = missingParams || verify.isError

    return (
        <MobileScreen>
            <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
                <Brand size={28} />

                {failed ? (
                    <>
                        <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                            <XCircleIcon className="size-8" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <h1 className="font-heading text-xl font-semibold tracking-tight text-balance">
                                Verifikasi gagal
                            </h1>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Tautan verifikasi tidak valid atau sudah kedaluwarsa. Minta tautan baru untuk
                                melanjutkan.
                            </p>
                        </div>
                        <div className="flex w-full flex-col gap-2">
                            <Button render={<Link to="/merchant/check-email" />} size="lg" className="h-11 w-full">
                                Kirim ulang email verifikasi
                            </Button>
                            <Button render={<Link to="/login" />} variant="ghost" size="lg" className="h-11 w-full">
                                Kembali ke masuk
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                            <CheckCircle2Icon className="size-8" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <h1 className="font-heading text-xl font-semibold tracking-tight text-balance">
                                Email berhasil diverifikasi
                            </h1>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Akun Anda sudah aktif. Silakan masuk untuk melanjutkan pendaftaran usaha.
                            </p>
                        </div>
                        <Button render={<Link to="/login" />} size="lg" className="h-11 w-full">
                            Masuk
                        </Button>
                    </>
                )}
            </div>
        </MobileScreen>
    )
}
