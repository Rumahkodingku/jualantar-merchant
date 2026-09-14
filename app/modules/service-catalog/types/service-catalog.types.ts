export type CatalogService = {
    id: string
    name: string
    slug: string
    description: string | null
    icon: string | null
}

export type CatalogCategory = {
    id: string
    service_id: string
    name: string
    slug: string
    description: string | null
    icon: string | null
}
