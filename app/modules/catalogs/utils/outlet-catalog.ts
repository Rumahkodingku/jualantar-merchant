import { ApiError } from "~/lib/api"

import type { AvailabilityStatus, CatalogStatus } from "../types"

/** Param URL untuk outlet aktif pada Outlet Catalog. */
export const CATALOG_OUTLET_PARAM = "outlet"

/** Jumlah outlet yang diambil sekali fetch untuk selector. */
export const CATALOG_OUTLETS_PAGE_SIZE = 100

/**
 * Employee memilih satu outlet; tidak ada opsi "Semua Outlet" karena endpoint
 * outlet catalog selalu terikat ke satu outlet.
 */
export type OutletSelection =
    | { type: "none" }
    | { type: "single"; outletId: string }
    | { type: "selected"; outletId: string }
    | { type: "unselected" }

/**
 * Derivasi murni dari daftar id outlet dalam scope + id terpilih di URL.
 * - tidak ada outlet → `none`
 * - tepat satu outlet → `single` (auto-pilih)
 * - lebih dari satu tanpa pilihan valid → `unselected` (user harus memilih)
 */
export function deriveOutletSelection(outletIds: string[], selectedId: string | null): OutletSelection {
    if (outletIds.length === 0) {
        return { type: "none" }
    }

    if (outletIds.length === 1) {
        const only = outletIds[0]

        return only === undefined ? { type: "none" } : { type: "single", outletId: only }
    }

    if (selectedId !== null && outletIds.includes(selectedId)) {
        return { type: "selected", outletId: selectedId }
    }

    return { type: "unselected" }
}

export function selectedOutletId(selection: OutletSelection): string | undefined {
    return selection.type === "single" || selection.type === "selected" ? selection.outletId : undefined
}

export type OutletCatalogErrorState = "forbidden" | "not-found" | "error"

/**
 * Bedakan error outlet catalog agar UI tidak menyamakan semuanya menjadi
 * "gagal memuat data": 403 → forbidden (sibling/capability), 404 → not found
 * (foreign outlet), sisanya → error generik.
 */
export function resolveOutletCatalogState(error: unknown): OutletCatalogErrorState {
    if (error instanceof ApiError) {
        if (error.status === 403) {
            return "forbidden"
        }

        if (error.status === 404) {
            return "not-found"
        }
    }

    return "error"
}

export interface OutletCatalogFilterValues {
    search: string
    category_id: string
    status: "" | CatalogStatus
    availability: "" | AvailabilityStatus
}

export function readOutletCatalogFilters(searchParams: URLSearchParams): OutletCatalogFilterValues {
    const status = searchParams.get("status") ?? ""
    const availability = searchParams.get("availability") ?? ""

    return {
        search: searchParams.get("q") ?? "",
        category_id: searchParams.get("category_id") ?? "",
        status: status === "active" || status === "inactive" ? status : "",
        availability: availability === "available" || availability === "unavailable" ? availability : "",
    }
}

export function hasOutletCatalogFilters(values: OutletCatalogFilterValues): boolean {
    return values.search !== "" || values.category_id !== "" || values.status !== "" || values.availability !== ""
}
