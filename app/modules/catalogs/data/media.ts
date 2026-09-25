import type { ProductMedia } from "../types/catalog.types"

const TIMESTAMP = "2026-09-20T08:00:00Z"

export const dummyMediaByProduct: Record<string, ProductMedia[]> = {
    "prd-001": [
        {
            id: "med-001",
            url: "/images/catalog/ayam-geprek.svg",
            alt_text: "Ayam Geprek",
            mime_type: "image/svg+xml",
            file_size: 245760,
            is_primary: true,
            display_order: 0,
            created_at: TIMESTAMP,
            updated_at: TIMESTAMP,
        },
        {
            id: "med-002",
            url: "/images/catalog/ayam-geprek-2.svg",
            alt_text: "Ayam Geprek tampak samping",
            mime_type: "image/svg+xml",
            file_size: 198420,
            is_primary: false,
            display_order: 1,
            created_at: TIMESTAMP,
            updated_at: TIMESTAMP,
        },
    ],
    "prd-002": [
        {
            id: "med-003",
            url: "/images/catalog/nasi-goreng.svg",
            alt_text: "Nasi Goreng Spesial",
            mime_type: "image/svg+xml",
            file_size: 210000,
            is_primary: true,
            display_order: 0,
            created_at: TIMESTAMP,
            updated_at: TIMESTAMP,
        },
    ],
    "prd-003": [
        {
            id: "med-004",
            url: "/images/catalog/es-teh.svg",
            alt_text: "Es Teh Manis",
            mime_type: "image/svg+xml",
            file_size: 150000,
            is_primary: true,
            display_order: 0,
            created_at: TIMESTAMP,
            updated_at: TIMESTAMP,
        },
    ],
}
