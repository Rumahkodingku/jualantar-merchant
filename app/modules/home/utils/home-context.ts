import type { HomeOutletContext } from "../types/home.types"

/** Param URL untuk konteks outlet terpilih. Absen = "Semua Outlet". */
export const HOME_OUTLET_PARAM = "outlet"

/** Jumlah outlet yang diambil sekali fetch untuk selector Home. */
export const HOME_OUTLETS_PAGE_SIZE = 50

/**
 * Derivasi murni Home context dari daftar id outlet + id terpilih di URL.
 * Id terpilih yang tidak ada di daftar dianggap tidak valid → fallback `all`.
 */
export function deriveHomeContext(outletIds: string[], selectedId: string | null): HomeOutletContext {
    if (outletIds.length === 0) {
        return { type: "none" }
    }

    if (outletIds.length === 1) {
        const only = outletIds[0]

        if (only === undefined) {
            return { type: "none" }
        }

        return { type: "single", outletId: only }
    }

    if (selectedId !== null && outletIds.includes(selectedId)) {
        return { type: "selected", outletId: selectedId, outletIds }
    }

    return { type: "all", outletIds }
}
