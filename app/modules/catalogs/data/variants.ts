import type { ProductVariant } from "../types/catalog.types"

const TIMESTAMP = "2026-09-20T08:00:00Z"

export const dummyVariantsByProduct: Record<string, ProductVariant[]> = {
    "prd-002": [
        {
            id: "var-001",
            name: "Regular",
            sku: "REG-001",
            price: 15000,
            status: "active",
            is_default: true,
            display_order: 0,
            created_at: TIMESTAMP,
            updated_at: TIMESTAMP,
        },
        {
            id: "var-002",
            name: "Large",
            sku: "LRG-001",
            price: 20000,
            status: "active",
            is_default: false,
            display_order: 1,
            created_at: TIMESTAMP,
            updated_at: TIMESTAMP,
        },
        {
            id: "var-003",
            name: "Jumbo",
            sku: null,
            price: 25000,
            status: "inactive",
            is_default: false,
            display_order: 2,
            created_at: TIMESTAMP,
            updated_at: TIMESTAMP,
        },
    ],
    "prd-004": [
        {
            id: "var-004",
            name: "Regular",
            sku: "KSG-001",
            price: 12000,
            status: "active",
            is_default: true,
            display_order: 0,
            created_at: TIMESTAMP,
            updated_at: TIMESTAMP,
        },
        {
            id: "var-005",
            name: "Large",
            sku: "KSG-002",
            price: 15000,
            status: "active",
            is_default: false,
            display_order: 1,
            created_at: TIMESTAMP,
            updated_at: TIMESTAMP,
        },
    ],
}
