import type { CatalogOutlet, OutletProductAssignment } from "../types/catalog.types"

const TIMESTAMP = "2026-09-20T08:00:00Z"

export const dummyOutlets: CatalogOutlet[] = [
    { id: "out-001", name: "JualAntar Pontianak", status: "active" },
    { id: "out-002", name: "JualAntar Siantan", status: "active" },
    { id: "out-003", name: "JualAntar Sungai Raya", status: "active" },
]

export const dummyAssignmentsByProduct: Record<string, OutletProductAssignment[]> = {
    "prd-001": [
        {
            id: "asg-001",
            product_id: "prd-001",
            outlet_id: "out-001",
            outlet: { id: "out-001", name: "JualAntar Pontianak", status: "active" },
            status: "active",
            availability_status: "available",
            unavailable_reason: null,
            display_order: 0,
            created_at: TIMESTAMP,
            updated_at: TIMESTAMP,
        },
        {
            id: "asg-002",
            product_id: "prd-001",
            outlet_id: "out-002",
            outlet: { id: "out-002", name: "JualAntar Siantan", status: "active" },
            status: "active",
            availability_status: "unavailable",
            unavailable_reason: "Stok habis",
            display_order: 1,
            created_at: TIMESTAMP,
            updated_at: TIMESTAMP,
        },
    ],
    "prd-002": [
        {
            id: "asg-003",
            product_id: "prd-002",
            outlet_id: "out-001",
            outlet: { id: "out-001", name: "JualAntar Pontianak", status: "active" },
            status: "active",
            availability_status: "available",
            unavailable_reason: null,
            display_order: 0,
            created_at: TIMESTAMP,
            updated_at: TIMESTAMP,
        },
        {
            id: "asg-004",
            product_id: "prd-002",
            outlet_id: "out-003",
            outlet: { id: "out-003", name: "JualAntar Sungai Raya", status: "active" },
            status: "inactive",
            availability_status: "available",
            unavailable_reason: null,
            display_order: 1,
            created_at: TIMESTAMP,
            updated_at: TIMESTAMP,
        },
    ],
}
