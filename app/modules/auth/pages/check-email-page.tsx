import { useSearchParams } from "react-router"

import { AuthLayout } from "~/components/layouts/auth-layout"

import { CheckEmailScreen } from "../components/check-email-screen"

export function CheckEmailPage() {
    const [searchParams] = useSearchParams()
    const email = searchParams.get("email") ?? ""

    return (
        <AuthLayout
            title="Cek email Anda"
            description={
                email !== "" ? (
                    <>
                        Kami mengirim tautan verifikasi ke <span className="font-medium text-foreground">{email}</span>.
                        Buka tautan tersebut untuk mengaktifkan akun.
                    </>
                ) : (
                    "Kami mengirim tautan verifikasi ke email Anda. Buka tautan tersebut untuk mengaktifkan akun."
                )
            }
        >
            <CheckEmailScreen initialEmail={email} />
        </AuthLayout>
    )
}
