import { useCallback } from "react"
import { useSearchParams } from "react-router"
import type { NavigateOptions, URLSearchParamsInit } from "react-router"

export type StableSetSearchParams = (
    nextInit?: URLSearchParamsInit | ((prev: URLSearchParams) => URLSearchParamsInit),
    navigateOpts?: NavigateOptions
) => void

/**
 * `useSearchParams` dengan scroll reset otomatis dimatikan.
 *
 * `useSearchParams` bawaan memicu navigasi router. Karena `<ScrollRestoration />`
 * meng-key posisi scroll dengan `location.key`, setiap navigasi baru (termasuk
 * penggantian `?tab=`) tidak punya posisi tersimpan sehingga efeknya
 * `window.scrollTo(0, 0)`. Untuk perubahan query param di halaman yang sama —
 * ganti tab, filter, search — posisi scroll justru harus dipertahankan.
 */
export function useStableSearchParams(): [URLSearchParams, StableSetSearchParams] {
    const [searchParams, setSearchParams] = useSearchParams()

    const stableSetSearchParams = useCallback<StableSetSearchParams>(
        (nextInit, navigateOpts) => {
            setSearchParams(nextInit, { ...navigateOpts, preventScrollReset: true })
        },
        [setSearchParams]
    )

    return [searchParams, stableSetSearchParams]
}
