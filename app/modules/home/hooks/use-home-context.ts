import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router"

import { useOperationalOutlets, type OperationalOutlet } from "~/modules/merchant-operations"

import type { HomeOutletContext } from "../types/home.types"
import { deriveHomeContext, HOME_OUTLET_PARAM, HOME_OUTLETS_PAGE_SIZE } from "../utils/home-context"

export type HomeContextValue = {
    context: HomeOutletContext
    outletTotal: number
    outlets: OperationalOutlet[]
    selectedOutlet: OperationalOutlet | null
    hasMoreOutlets: boolean
    isPending: boolean
    isError: boolean
    error: unknown
    refetch: () => void
    selectOutlet: (outletId: string | null) => void
}

function readSelectedId(searchParams: URLSearchParams): string | null {
    const value = searchParams.get(HOME_OUTLET_PARAM)

    return value === null || value === "" ? null : value
}

/**
 * Sumber tunggal konteks outlet di Home.
 *
 * - count dari `meta.total` (real API, bukan hardcoded);
 * - daftar selector dari satu fetch `per_page: 50`;
 * - pilihan outlet tersimpan di URL `?outlet=<id>` agar deep-linkable,
 *   tahan refresh, dan mendukung browser back/forward;
 * - pemilihan outlet TIDAK mengubah role/permission/session.
 */
export function useHomeContext(): HomeContextValue {
    const [searchParams, setSearchParams] = useSearchParams()
    const outletsQuery = useOperationalOutlets({ per_page: HOME_OUTLETS_PAGE_SIZE })

    const outlets = useMemo(() => outletsQuery.data?.data ?? [], [outletsQuery.data])
    const outletIds = useMemo(() => outlets.map((outlet) => outlet.id), [outlets])
    const selectedId = readSelectedId(searchParams)

    const context = useMemo(() => deriveHomeContext(outletIds, selectedId), [outletIds, selectedId])
    const outletTotal = outletsQuery.data?.meta.total ?? 0

    const selectedOutlet = useMemo(() => {
        const activeId = context.type === "single" || context.type === "selected" ? context.outletId : null

        if (activeId === null) {
            return null
        }

        return outlets.find((outlet) => outlet.id === activeId) ?? null
    }, [context, outlets])

    const selectOutlet = useCallback(
        (outletId: string | null) => {
            const next = new URLSearchParams(searchParams)

            if (outletId === null) {
                next.delete(HOME_OUTLET_PARAM)
            } else {
                next.set(HOME_OUTLET_PARAM, outletId)
            }

            setSearchParams(next)
        },
        [searchParams, setSearchParams]
    )

    return {
        context,
        outletTotal,
        outlets,
        selectedOutlet,
        hasMoreOutlets: outletTotal > outlets.length,
        isPending: outletsQuery.isPending,
        isError: outletsQuery.isError,
        error: outletsQuery.error,
        refetch: () => {
            void outletsQuery.refetch()
        },
        selectOutlet,
    }
}
