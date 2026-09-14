import { Link, Navigate } from "react-router"

import { AuthLayout } from "~/components/layouts/auth-layout"
import { SplashScreen } from "~/components/splash-screen"

import { LoginForm } from "../components/login-form"
import { useSession } from "../hooks/use-session"

export function LoginPage() {
    const { isAuthenticated, isLoading } = useSession()

    if (isLoading) {
        return <SplashScreen label="Memeriksa sesi…" />
    }

    if (isAuthenticated) {
        return <Navigate to="/app" replace />
    }

    return (
        <AuthLayout
            title="Masuk ke akun merchant"
            description="Gunakan email dan kata sandi yang terdaftar untuk mulai mendaftarkan usaha Anda."
            footer={
                <>
                    Belum punya akun?{" "}
                    <Link
                        to="/merchant/register"
                        className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                        Daftar merchant
                    </Link>
                </>
            }
        >
            <LoginForm />
        </AuthLayout>
    )
}
