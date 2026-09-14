export { ProtectedRoute } from "./components/protected-route"
export { LoginPage } from "./pages/login-page"
export { RegisterPage } from "./pages/register-page"
export { CheckEmailPage } from "./pages/check-email-page"
export { VerifyEmailPage } from "./pages/verify-email-page"
export { useSession } from "./hooks/use-session"
export {
    useLogin,
    useLogout,
    useRegisterMerchant,
    useResendVerification,
    useVerifyEmail,
} from "./services/auth.mutations"
export { meQueryOptions } from "./services/auth.queries"
export { authKeys } from "./services/auth.keys"
export type {
    AuthUser,
    LoginInput,
    LoginResult,
    RegisterMerchantInput,
    RegisteredMerchant,
    VerifyEmailParams,
} from "./types/auth.types"
