import { z } from "zod"

export const merchantTypeSchema = z.enum(["individual", "company"])

export const MERCHANT_TYPE_OPTIONS: {
    value: z.infer<typeof merchantTypeSchema>
    label: string
    description: string
}[] = [
    {
        value: "individual",
        label: "Perorangan",
        description: "Usaha milik sendiri, tanpa badan usaha.",
    },
    {
        value: "company",
        label: "Badan usaha",
        description: "PT, CV, UD, koperasi, atau yayasan.",
    },
]

export const businessSchema = z.object({
    business_name: z.string().trim().min(1, "Nama usaha wajib diisi.").max(100, "Nama usaha maksimal 100 karakter."),
    type: merchantTypeSchema,
    description: z.string().trim().max(1000, "Deskripsi maksimal 1000 karakter.").optional(),
})

export type BusinessFormValues = z.infer<typeof businessSchema>
