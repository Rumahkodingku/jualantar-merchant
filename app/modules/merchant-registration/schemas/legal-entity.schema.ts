import { z } from "zod"

export const legalEntityTypeSchema = z.enum(["pt", "cv", "ud", "koperasi", "yayasan"])

export const LEGAL_ENTITY_TYPE_OPTIONS: {
    value: z.infer<typeof legalEntityTypeSchema>
    label: string
}[] = [
    { value: "pt", label: "PT" },
    { value: "cv", label: "CV" },
    { value: "ud", label: "UD" },
    { value: "koperasi", label: "Koperasi" },
    { value: "yayasan", label: "Yayasan" },
]

const regionId = z.coerce.number().int().positive("Pilih wilayah lengkap terlebih dahulu.")

export const legalEntitySchema = z.object({
    entity_type: legalEntityTypeSchema,
    name: z.string().trim().min(1, "Nama badan usaha wajib diisi.").max(150, "Nama badan usaha maksimal 150 karakter."),
    nib: z.string().trim().min(1, "NIB wajib diisi.").max(100, "NIB maksimal 100 karakter."),
    npwp: z.string().trim().min(1, "NPWP wajib diisi.").max(25, "NPWP maksimal 25 karakter."),
    address: z.string().trim().max(500).optional(),
    province_id: regionId,
    regency_id: regionId,
    district_id: regionId,
    village_id: regionId,
    postal_code: z.string().trim().max(10).optional(),
})

export type LegalEntityFormValues = z.infer<typeof legalEntitySchema>
