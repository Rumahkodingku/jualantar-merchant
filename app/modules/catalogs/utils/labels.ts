import type { AvailabilityStatus, CatalogStatus, ProductType, SelectionType } from "../types/catalog.types"

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
    simple: "Simple",
    variable: "Variable",
}

export const PRODUCT_TYPE_FORM_LABEL: Record<ProductType, string> = {
    simple: "Simple Product",
    variable: "Variable Product",
}

export const STATUS_LABEL: Record<CatalogStatus, string> = {
    active: "Aktif",
    inactive: "Nonaktif",
}

export const SELECTION_TYPE_LABEL: Record<SelectionType, string> = {
    single: "Single",
    multiple: "Multiple",
}

export const SELECTION_TYPE_OPTIONS: ReadonlyArray<{ value: SelectionType; label: string }> = [
    { value: "single", label: SELECTION_TYPE_LABEL.single },
    { value: "multiple", label: SELECTION_TYPE_LABEL.multiple },
]

export const AVAILABILITY_LABEL: Record<AvailabilityStatus, string> = {
    available: "Tersedia",
    unavailable: "Tidak tersedia",
}

export function statusTone(status: CatalogStatus): "positive" | "negative" {
    return status === "active" ? "positive" : "negative"
}

export function availabilityTone(status: AvailabilityStatus): "positive" | "negative" {
    return status === "available" ? "positive" : "negative"
}
