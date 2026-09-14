import { useSearchParams } from "react-router"

import { Brand } from "~/components/brand"
import { MobileScreen } from "~/components/layouts/mobile-screen"

import { CheckEmailScreen } from "../components/check-email-screen"

export function CheckEmailPage() {
    const [searchParams] = useSearchParams()
    const email = searchParams.get("email") ?? ""

    return (
        <MobileScreen>
            <div className="flex flex-col items-start px-6 pt-[max(2rem,env(safe-area-inset-top))]">
                <Brand size={28} />
            </div>
            <CheckEmailScreen initialEmail={email} />
        </MobileScreen>
    )
}
