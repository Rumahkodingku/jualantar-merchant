import { MailCheckIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router"

import { Alert, AlertDescription } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Field, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Spinner } from "~/components/ui/spinner"
import { ApiError } from "~/lib/api"
import { getApiErrorMessage } from "~/lib/api-form"

import { useResendVerification } from "../services/auth.mutations"

const RESEND_COOLDOWN_SECONDS = 60

export function CheckEmailScreen({ initialEmail }: { initialEmail: string }) {
    const resend = useResendVerification()
    const [email, setEmail] = useState(initialEmail)
    const [cooldown, setCooldown] = useState(0)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (cooldown <= 0) {
            return
        }

        const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000)

        return () => window.clearTimeout(timer)
    }, [cooldown])

    function handleResend() {
        setMessage(null)
        setError(null)

        resend.mutate(email.trim(), {
            onSuccess: () => {
                setMessage("Email verifikasi telah dikirim ulang.")
                setCooldown(RESEND_COOLDOWN_SECONDS)
            },
            onError: (resendError) => {
                setError(
                    resendError instanceof ApiError && resendError.status === 429
                        ? "Terlalu banyak permintaan. Coba lagi beberapa saat."
                        : getApiErrorMessage(resendError)
                )
            },
        })
    }

    const disabled = resend.isPending || cooldown > 0 || email.trim() === ""

    return (
        <div className="flex flex-1 flex-col justify-center gap-6 px-6 py-12">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <MailCheckIcon className="size-8" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <h1 className="font-heading text-xl font-semibold tracking-tight text-balance">Cek email Anda</h1>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        Kami mengirim tautan verifikasi
                        {initialEmail !== "" ? (
                            <>
                                {" "}
                                ke <span className="font-medium text-foreground">{initialEmail}</span>
                            </>
                        ) : null}
                        . Buka tautan tersebut untuk mengaktifkan akun.
                    </p>
                </div>
            </div>

            {message !== null ? (
                <Alert>
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            ) : null}

            {error !== null ? (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : null}

            <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
                <Field>
                    <FieldLabel htmlFor="resend-email">Tidak menerima email?</FieldLabel>
                    <Input
                        id="resend-email"
                        type="email"
                        inputMode="email"
                        className="h-11"
                        placeholder="nama@usaha.id"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                    />
                </Field>
                <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="h-11 w-full"
                    disabled={disabled}
                    onClick={handleResend}
                >
                    {resend.isPending ? (
                        <>
                            <Spinner /> Mengirim…
                        </>
                    ) : cooldown > 0 ? (
                        `Kirim ulang dalam ${cooldown} dtk`
                    ) : (
                        "Kirim ulang email verifikasi"
                    )}
                </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
                Sudah verifikasi?{" "}
                <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                    Masuk
                </Link>
            </p>
        </div>
    )
}
