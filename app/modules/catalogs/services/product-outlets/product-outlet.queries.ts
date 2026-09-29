import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { useOperationalOutlets, type OperationalOutlet } from "~/modules/merchant-operations"

import { catalogKeys } from "../catalog.keys"
import { catalogRepository } from "../catalog.repository"
import type { CatalogOutlet, ProductOutletRow } from "../../types/catalog.types"

const OUTLETS_PAGE_SIZE = 100

function toCatalogOutlet(outlet: OperationalOutlet): CatalogOutlet {
    return { id: outlet.id, name: outlet.name, status: outlet.status }
}

export function useProductAssignments(productId: string | undefined, enabled = true) {
    return useQuery({
        queryKey: catalogKeys.productAssignments(productId ?? ""),
        queryFn: () => catalogRepository.productOutlets.list(productId as string),
        enabled: enabled && productId !== undefined && productId.length > 0,
    })
}

export function useOutlets() {
    const query = useOperationalOutlets({ per_page: OUTLETS_PAGE_SIZE })
    const data = useMemo(() => query.data?.data.map(toCatalogOutlet), [query.data])

    return {
        data,
        isPending: query.isPending,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    }
}

/**
 * The catalog assignment endpoint only summarises its outlet as `{ id, name,
 * status }`. The merchant-operations outlet directory already exposes the full
 * record, so the richer outlet is resolved here by joining on `outlet_id`
 * instead of widening the catalog resource or issuing a request per row.
 *
 * Both queries share the `enabled` gate so the directory is not fetched until
 * the caller actually needs the outlet tab.
 */
export function useProductOutletRows(productId: string | undefined, enabled = true) {
    const assignmentsQuery = useProductAssignments(productId, enabled)
    const outletsQuery = useOperationalOutlets({ per_page: OUTLETS_PAGE_SIZE }, { enabled })

    const outletById = useMemo(
        () => new Map((outletsQuery.data?.data ?? []).map((outlet) => [outlet.id, outlet])),
        [outletsQuery.data]
    )

    const rows = useMemo<ProductOutletRow[]>(
        () =>
            (assignmentsQuery.data ?? []).map((assignment) => ({
                assignment,
                outlet: outletById.get(assignment.outlet_id) ?? null,
            })),
        [assignmentsQuery.data, outletById]
    )

    return {
        rows,
        isPending: assignmentsQuery.isPending || outletsQuery.isPending,
        isError: assignmentsQuery.isError || outletsQuery.isError,
        error: assignmentsQuery.error ?? outletsQuery.error,
        refetch: async () => {
            await Promise.all([assignmentsQuery.refetch(), outletsQuery.refetch()])
        },
    }
}
