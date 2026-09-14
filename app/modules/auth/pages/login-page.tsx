import { Link, Navigate } from "react-router"

import { Brand } from "~/components/brand"
import { FullScreenLoader } from "~/components/full-screen-loader"
import { MobileScreen } from "~/components/layouts/mobile-screen"

import { LoginForm } from "../components/login-form"
import { useSession } from "../hooks/use-session"

export function LoginPage() {
    const { isAuthenticated, isLoading } = useSession()

    if (isLoading) {
        return <FullScreenLoader label="Memeriksa sesi…" />
    }

    if (isAuthenticated) {
        return <Navigate to="/merchant/registration" replace />
    }

    return (
        <MobileScreen>
            <div className="flex flex-1 flex-col justify-center gap-8 px-6 py-12">
                <div className="flex flex-col gap-4">
                    <Brand size={32} />
                    <div className="flex flex-col gap-1.5">
                        <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance">
                            Masuk ke akun merchant
                        </h1>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Gunakan email dan kata sandi yang terdaftar untuk mulai mendaftarkan usaha Anda.
                        </p>
                    </div>
                </div>

                <LoginForm />

                <p className="text-center text-xs leading-relaxed text-muted-foreground">
                    Belum punya akun?{" "}
                    <Link
                        to="/merchant/register"
                        className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                        Daftar merchant
                    </Link>
                </p>
            </div>
        </MobileScreen>
    )
}
