export const CATALOGS_BASE = "/catalogs"

export const CATALOGS_PATHS = {
    home: CATALOGS_BASE,
    new: `${CATALOGS_BASE}/new`,
    categories: `${CATALOGS_BASE}/categories`,
    modifiers: `${CATALOGS_BASE}/modifiers`,
    detail: (productId: string) => `${CATALOGS_BASE}/products/${productId}`,
    edit: (productId: string) => `${CATALOGS_BASE}/products/${productId}/edit`,
} as const
