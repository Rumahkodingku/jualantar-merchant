import { z } from "zod"

export const merchantProfileSchema = z.object({
    business_name: z.string().trim().min(1, "Nama usaha wajib diisi.").max(100, "Nama usaha maksimal 100 karakter."),
    description: z.string().trim().max(1000, "Deskripsi maksimal 1000 karakter.").optional(),
    operational_phone: z.string().trim().max(20, "Telepon maksimal 20 karakter.").optional(),
    operational_email: z.union([z.string().trim().email("Email tidak valid.").max(100), z.literal("")]).optional(),
    website: z.union([z.string().trim().url("URL tidak valid.").max(255), z.literal("")]).optional(),
})

export type MerchantProfileFormValues = z.infer<typeof merchantProfileSchema>

function emptyToNull(value: string | undefined): string | null {
    return value === undefined || value === "" ? null : value
}

export function merchantProfilePayload(
    values: MerchantProfileFormValues,
    logo: string | null
): {
    business_name: string
    description: string | null
    logo: string | null
    operational_phone: string | null
    operational_email: string | null
    website: string | null
} {
    return {
        business_name: values.business_name.trim(),
        description: emptyToNull(values.description?.trim()),
        logo,
        operational_phone: emptyToNull(values.operational_phone?.trim()),
        operational_email: emptyToNull(values.operational_email?.trim()),
        website: emptyToNull(values.website?.trim()),
    }
}
