import { useMutation, useQueryClient } from "@tanstack/react-query"

import {
    attachDocument,
    createOutlet,
    createRegistration,
    createRegistrationUpload,
    deleteOutlet,
    reopenRegistration,
    saveCategories,
    saveIdentity,
    saveLegalEntity,
    savePayoutAccount,
    saveService,
    submitRegistration,
    updateBusinessProfile,
    updateOutlet,
} from "./merchant-registration.api"
import { merchantRegistrationKeys } from "./merchant-registration.keys"
import type { MerchantRegistration, OutletInput } from "../types/merchant-registration.types"

function useRegistrationUpdate<TInput>(mutationFn: (input: TInput) => Promise<MerchantRegistration>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn,
        onSuccess: (registration) => {
            queryClient.setQueryData(merchantRegistrationKeys.detail(), registration)
            void queryClient.invalidateQueries({
                queryKey: merchantRegistrationKeys.review(),
            })
        },
    })
}

export function useUpdateBusinessProfile() {
    return useRegistrationUpdate(updateBusinessProfile)
}

export function useSaveIdentity() {
    return useRegistrationUpdate(saveIdentity)
}

export function useSaveLegalEntity() {
    return useRegistrationUpdate(saveLegalEntity)
}

export function useSaveService() {
    return useRegistrationUpdate(saveService)
}

export function useSaveCategories() {
    return useRegistrationUpdate(saveCategories)
}

export function useCreateOutlet() {
    return useRegistrationUpdate(createOutlet)
}

export function useUpdateOutlet() {
    return useRegistrationUpdate((input: { outletId: string; values: Partial<OutletInput> }) =>
        updateOutlet(input.outletId, input.values)
    )
}

export function useDeleteOutlet() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteOutlet,
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: merchantRegistrationKeys.detail(),
            })
        },
    })
}

export function useSavePayoutAccount() {
    return useRegistrationUpdate(savePayoutAccount)
}

export function useCreateRegistrationUpload() {
    return useMutation({ mutationFn: createRegistrationUpload })
}

export function useAttachDocument() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: attachDocument,
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: merchantRegistrationKeys.detail(),
            })
        },
    })
}

export function useCreateRegistration() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: createRegistration,
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: merchantRegistrationKeys.detail(),
            })
        },
    })
}

export function useSubmitRegistration() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: submitRegistration,
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: merchantRegistrationKeys.detail(),
            })
        },
    })
}

export function useReopenRegistration() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: reopenRegistration,
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: merchantRegistrationKeys.detail(),
            })
        },
    })
}
