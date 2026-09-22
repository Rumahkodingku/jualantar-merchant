import type { OperationalOutletListParams } from "../types/merchant-operations.types"

const ROOT = "merchant-operations"

export const merchantOperationsKeys = {
    all: [ROOT] as const,
    summary: () => [ROOT, "summary"] as const,
    profile: () => [ROOT, "profile"] as const,
    outlets: (params: OperationalOutletListParams = {}) => [ROOT, "outlets", params] as const,
    outletsRoot: () => [ROOT, "outlets"] as const,
    outlet: (outletId: string) => [ROOT, "outlet", outletId] as const,
    /** Prefix that matches every outlet-scoped query (detail + sections). */
    scopedOutlets: () => [ROOT, "outlet"] as const,
    employees: (outletId: string) => [ROOT, "outlet", outletId, "employees"] as const,
    operatingHours: (outletId: string) => [ROOT, "outlet", outletId, "operating-hours"] as const,
    serviceArea: (outletId: string) => [ROOT, "outlet", outletId, "service-area"] as const,
    availability: (outletId: string) => [ROOT, "outlet", outletId, "availability"] as const,
}
