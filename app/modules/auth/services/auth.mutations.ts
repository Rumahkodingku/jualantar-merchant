import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"

import { clearAuthToken, setAuthToken } from "~/lib/auth-token"

import { fetchMe, login, logout, registerMerchant, resendVerification, verifyEmail } from "./auth.api"
import { authKeys } from "./auth.keys"

export function useLogin() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: login,
        onSuccess: (result) => {
            setAuthToken(result.token)
            queryClient.setQueryData(authKeys.me(), result.user)
        },
    })
}

export function useLogout() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: logout,
        onSettled: () => {
            clearAuthToken()
            queryClient.clear()
            navigate("/login", { replace: true })
        },
    })
}

export function useRefreshSession() {
    const queryClient = useQueryClient()

    return () => queryClient.fetchQuery({ queryKey: authKeys.me(), queryFn: fetchMe })
}

export function useRegisterMerchant() {
    return useMutation({ mutationFn: registerMerchant })
}

export function useResendVerification() {
    return useMutation({ mutationFn: resendVerification })
}

export function useVerifyEmail() {
    return useMutation({ mutationFn: verifyEmail })
}
