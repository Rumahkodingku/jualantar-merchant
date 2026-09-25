import type { Product } from "../types/catalog.types"

const TIMESTAMP = "2026-09-20T08:00:00Z"

export const dummyProducts: Product[] = [
    {
        id: "prd-001",
        category_id: "cat-001",
        name: "Ayam Geprek",
        description: "Ayam goreng crispy dengan sambal khas JualAntar.",
        product_type: "simple",
        price: 18000,
        status: "active",
        display_order: 0,
        created_at: TIMESTAMP,
        updated_at: TIMESTAMP,
    },
    {
        id: "prd-002",
        category_id: "cat-001",
        name: "Nasi Goreng Spesial",
        description: "Nasi goreng dengan topping telur dan ayam.",
        product_type: "variable",
        price: null,
        status: "active",
        display_order: 1,
        created_at: TIMESTAMP,
        updated_at: TIMESTAMP,
    },
    {
        id: "prd-003",
        category_id: "cat-002",
        name: "Es Teh Manis",
        description: null,
        product_type: "simple",
        price: 5000,
        status: "active",
        display_order: 2,
        created_at: TIMESTAMP,
        updated_at: TIMESTAMP,
    },
    {
        id: "prd-004",
        category_id: "cat-002",
        name: "Kopi Susu Gula Aren",
        description: "Kopi susu dengan gula aren asli.",
        product_type: "variable",
        price: null,
        status: "inactive",
        display_order: 3,
        created_at: TIMESTAMP,
        updated_at: TIMESTAMP,
    },
]
