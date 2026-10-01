import { useCallback, useMemo } from "react"

import { useStableSearchParams } from "~/hooks/use-stable-search-params"
import { useOperationalOutlets, type OperationalOutlet } from "~/modules/merchant-operations"

import {
    CATALOG_OUTLETS_PAGE_SIZE,
    CATALOG_OUTLET_PARAM,
    deriveOutletSelection,
    selectedOutletId,
    type OutletSelection,
} from "../utils/outlet-catalog"

export type OutletCatalogContextValue = {
    selection: OutletSelection
    outletId: string | undefined
    outlets: OperationalOutlet[]
    selectedOutlet: OperationalOutlet | null
    isPending: boolean
    isError: boolean
    error: unknown
    refetch: () => void
    selectOutlet: (outletId: string) => void
}

function readSelectedId(searchParams: URLSearchParams): string | null {
    const value = searchParams.get(CATALOG_OUTLET_PARAM)

    return value === null || value === "" ? null : value
}

/**
 * Sumber tunggal konteks outlet untuk Outlet Catalog.
 *
 * Daftar outlet berasal dari `useOperationalOutlets`, yang di backend sudah
 * ter-scope ke outlet milik merchant yang di-assign ke user — jadi employee
 * tidak pernah melihat outlet merchant lain atau sibling yang tidak ditugaskan.
 * Pilihan outlet disimpan di URL `?outlet=<id>` sehingga deep-linkable, tahan
 * refresh, dan perubahan outlet otomatis mengganti seluruh query key
 * outlet-scoped.
 */
export function useOutletCatalogContext(): OutletCatalogContextValue {
    const [searchParams, setSearchParams] = useStableSearchParams()
    const outletsQuery = useOperationalOutlets({ per_page: CATALOG_OUTLETS_PAGE_SIZE })

    const outlets = useMemo(() => outletsQuery.data?.data ?? [], [outletsQuery.data])
    const outletIds = useMemo(() => outlets.map((outlet) => outlet.id), [outlets])
    const selection = useMemo(
        () => deriveOutletSelection(outletIds, readSelectedId(searchParams)),
        [outletIds, searchParams]
    )

    const outletId = selectedOutletId(selection)
    const selectedOutlet = useMemo(() => outlets.find((outlet) => outlet.id === outletId) ?? null, [outlets, outletId])

    const selectOutlet = useCallback(
        (nextOutletId: string) => {
            const next = new URLSearchParams(searchParams)
            next.set(CATALOG_OUTLET_PARAM, nextOutletId)
            setSearchParams(next, { replace: true })
        },
        [searchParams, setSearchParams]
    )

    return {
        selection,
        outletId,
        outlets,
        selectedOutlet,
        isPending: outletsQuery.isPending,
        isError: outletsQuery.isError,
        error: outletsQuery.error,
        refetch: () => {
            void outletsQuery.refetch()
        },
        selectOutlet,
    }
}
