import { Link, Navigate } from "react-router"

import { Brand } from "~/components/brand"
import { FullScreenLoader } from "~/components/full-screen-loader"
import { MobileScreen } from "~/components/layouts/mobile-screen"

import { RegisterForm } from "../components/register-form"
import { useSession } from "../hooks/use-session"

export function RegisterPage() {
    const { isAuthenticated, isLoading } = useSession()

    if (isLoading) {
        return <FullScreenLoader label="Memeriksa sesi…" />
    }

    if (isAuthenticated) {
        return <Navigate to="/merchant/registration" replace />
    }

    return (
        <MobileScreen>
            <div className="flex flex-1 flex-col">
                <div className="flex flex-col gap-4 px-6 pt-[max(2rem,env(safe-area-inset-top))]">
                    <Brand size={32} />
                    <div className="flex flex-col gap-1.5">
                        <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance">
                            Daftar akun merchant
                        </h1>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Buat akun untuk mulai mendaftarkan usaha Anda di JualAntar.
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Sudah punya akun?{" "}
                        <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                            Masuk
                        </Link>
                    </p>
                </div>

                <RegisterForm />
            </div>
        </MobileScreen>
    )
}
