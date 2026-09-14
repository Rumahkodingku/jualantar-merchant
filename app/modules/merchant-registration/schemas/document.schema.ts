import type { MerchantDocumentType } from "../types/merchant-registration.types"

export const DOCUMENT_TYPE_OPTIONS: {
    value: MerchantDocumentType
    label: string
}[] = [
    { value: "ktp", label: "KTP" },
    { value: "npwp", label: "NPWP" },
    { value: "nib", label: "NIB" },
    { value: "siup", label: "SIUP" },
    { value: "akta_pendirian", label: "Akta Pendirian" },
    { value: "lainnya", label: "Lainnya" },
]

export function documentTypeLabel(type: MerchantDocumentType): string {
    return DOCUMENT_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type
}
