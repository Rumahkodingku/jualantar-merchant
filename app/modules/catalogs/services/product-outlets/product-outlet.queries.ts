import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"

import { useOperationalOutlets, type OperationalOutlet } from "~/modules/merchant-operations"

import { catalogKeys } from "../catalog.keys"
import { catalogRepository } from "../catalog.repository"
import type { CatalogOutlet } from "../../types/catalog.types"

const OUTLETS_PAGE_SIZE = 100

function toCatalogOutlet(outlet: OperationalOutlet): CatalogOutlet {
    return { id: outlet.id, name: outlet.name, status: outlet.status }
}

export function useProductAssignments(productId: string | undefined) {
    return useQuery({
        queryKey: catalogKeys.productAssignments(productId ?? ""),
        queryFn: () => catalogRepository.productOutlets.list(productId as string),
        enabled: productId !== undefined && productId.length > 0,
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
