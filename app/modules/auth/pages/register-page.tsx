import { Link, Navigate } from "react-router"

import { AuthLayout } from "~/components/layouts/auth-layout"
import { SplashScreen } from "~/components/splash-screen"

import { RegisterForm } from "../components/register-form"
import { useSession } from "../hooks/use-session"

export function RegisterPage() {
    const { isAuthenticated, isLoading } = useSession()

    if (isLoading) {
        return <SplashScreen label="Memeriksa sesi…" />
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return (
        <AuthLayout
            title="Daftar akun merchant"
            description="Buat akun untuk mulai mendaftarkan usaha Anda di JualAntar."
            footer={
                <>
                    Sudah punya akun?{" "}
                    <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                        Masuk
                    </Link>
                </>
            }
        >
            <RegisterForm />
        </AuthLayout>
    )
}
