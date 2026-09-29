import type { PaginatedResponse } from "../types"

/** The largest page the API will hand back, used whenever a list must be whole. */
export const MAX_PER_PAGE = 100

/**
 * Walks every page of a paginated endpoint and flattens it into one array.
 *
 * Several catalog lists — variants, media, outlet assignments — are only ever
 * read in full, because a reorder request or a bundle create needs the complete
 * set. Asking for the largest page and following `last_page` keeps that in one
 * place instead of spreading page cursors through every caller.
 */
export async function fetchAllPages<TWire, TItem>(
    fetchPage: (page: number) => Promise<PaginatedResponse<TWire>>,
    map: (wire: TWire) => TItem
): Promise<TItem[]> {
    const first = await fetchPage(1)
    const items = first.data.map(map)

    for (let page = 2; page <= first.meta.last_page; page += 1) {
        const next = await fetchPage(page)
        items.push(...next.data.map(map))
    }

    return items
}
