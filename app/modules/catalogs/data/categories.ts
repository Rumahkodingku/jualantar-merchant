import type { CatalogCategory } from "../types/catalog.types"

const TIMESTAMP = "2026-09-20T08:00:00Z"

export const dummyCategories: CatalogCategory[] = [
    {
        id: "cat-001",
        name: "Makanan",
        description: "Menu makanan utama.",
        status: "active",
        display_order: 0,
        created_at: TIMESTAMP,
        updated_at: TIMESTAMP,
    },
    {
        id: "cat-002",
        name: "Minuman",
        description: "Menu minuman.",
        status: "active",
        display_order: 1,
        created_at: TIMESTAMP,
        updated_at: TIMESTAMP,
    },
    {
        id: "cat-003",
        name: "Dessert",
        description: "Menu penutup.",
        status: "active",
        display_order: 2,
        created_at: TIMESTAMP,
        updated_at: TIMESTAMP,
    },
    {
        id: "cat-004",
        name: "Snack",
        description: "Camilan ringan.",
        status: "inactive",
        display_order: 3,
        created_at: TIMESTAMP,
        updated_at: TIMESTAMP,
    },
]
