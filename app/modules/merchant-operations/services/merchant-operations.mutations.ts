import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query"

import { authKeys } from "~/modules/auth"

import {
    activateMerchant,
    activateOutlet,
    changeOutletEmployeeRole,
    createOutlet,
    createOutletEmployee,
    deactivateOutlet,
    reactivateMerchant,
    removeOutletEmployee,
    suspendMerchant,
    updateOperatingHours,
    updateOperationalProfile,
    updateOutlet,
    updateServiceArea,
} from "./merchant-operations.api"
import { merchantOperationsKeys } from "./merchant-operations.keys"
import type {
    CreateOutletEmployeeInput,
    OperationalOutletInput,
    OperationalProfileInput,
    OutletUserRole,
    OperatingHoursPayload,
    ServiceAreaInput,
} from "../types/merchant-operations.types"

export function useUpdateOperationalProfile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: OperationalProfileInput) => updateOperationalProfile(input),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: merchantOperationsKeys.profile() })
            void queryClient.invalidateQueries({ queryKey: merchantOperationsKeys.summary() })
        },
    })
}

/**
 * A merchant status change cascades into every outlet availability, so the
 * whole outlet-scoped cache prefix is invalidated.
 */
function useMerchantStatusMutation(mutationFn: () => ReturnType<typeof activateMerchant>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: merchantOperationsKeys.summary() })
            void queryClient.invalidateQueries({ queryKey: merchantOperationsKeys.profile() })
            void queryClient.invalidateQueries({ queryKey: merchantOperationsKeys.scopedOutlets() })
        },
    })
}

export function useActivateMerchant() {
    return useMerchantStatusMutation(activateMerchant)
}

export function useSuspendMerchant() {
    return useMerchantStatusMutation(suspendMerchant)
}

export function useReactivateMerchant() {
    return useMerchantStatusMutation(reactivateMerchant)
}

export function useCreateOutlet() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: OperationalOutletInput) => createOutlet(input),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: merchantOperationsKeys.outletsRoot() })
        },
    })
}

export function useUpdateOutlet(outletId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: Partial<OperationalOutletInput>) => updateOutlet(outletId, input),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: merchantOperationsKeys.outlet(outletId) })
            void queryClient.invalidateQueries({ queryKey: merchantOperationsKeys.outletsRoot() })
        },
    })
}

function useOutletStatusMutation(outletId: string, mutationFn: (id: string) => ReturnType<typeof activateOutlet>) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => mutationFn(outletId),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: merchantOperationsKeys.outlet(outletId) })
            void queryClient.invalidateQueries({ queryKey: merchantOperationsKeys.outletsRoot() })
            void queryClient.invalidateQueries({ queryKey: merchantOperationsKeys.availability(outletId) })
        },
    })
}

export function useActivateOutlet(outletId: string) {
    return useOutletStatusMutation(outletId, activateOutlet)
}

export function useDeactivateOutlet(outletId: string) {
    return useOutletStatusMutation(outletId, deactivateOutlet)
}

/**
 * An employee assignment change can also change the current user's own outlet
 * role (self-assignment), so the session/authorization cache is refreshed too.
 */
function invalidateEmployeeCaches(queryClient: QueryClient, outletId: string) {
    void queryClient.invalidateQueries({ queryKey: merchantOperationsKeys.employees(outletId) })
    void queryClient.invalidateQueries({ queryKey: authKeys.me() })
}

export function useCreateOutletEmployee(outletId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: CreateOutletEmployeeInput) => createOutletEmployee(outletId, input),
        onSuccess: () => invalidateEmployeeCaches(queryClient, outletId),
    })
}

export function useChangeOutletEmployeeRole(outletId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: { userId: string; role: OutletUserRole }) =>
            changeOutletEmployeeRole(outletId, input.userId, input.role),
        onSuccess: () => invalidateEmployeeCaches(queryClient, outletId),
    })
}

export function useRemoveOutletEmployee(outletId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (userId: string) => removeOutletEmployee(outletId, userId),
        onSuccess: () => invalidateEmployeeCaches(queryClient, outletId),
    })
}

export function useUpdateOperatingHours(outletId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: OperatingHoursPayload) => updateOperatingHours(outletId, payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: merchantOperationsKeys.operatingHours(outletId) })
            void queryClient.invalidateQueries({ queryKey: merchantOperationsKeys.availability(outletId) })
        },
    })
}

export function useUpdateServiceArea(outletId: string) {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: ServiceAreaInput) => updateServiceArea(outletId, input),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: merchantOperationsKeys.serviceArea(outletId) })
            void queryClient.invalidateQueries({ queryKey: merchantOperationsKeys.outlet(outletId) })
            void queryClient.invalidateQueries({ queryKey: merchantOperationsKeys.outletsRoot() })
        },
    })
}
