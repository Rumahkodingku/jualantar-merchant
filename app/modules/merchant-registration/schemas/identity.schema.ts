import { z } from "zod"

export const identityTypeSchema = z.enum(["ktp", "sim", "paspor"])

export const IDENTITY_TYPE_OPTIONS: {
    value: z.infer<typeof identityTypeSchema>
    label: string
}[] = [
    { value: "ktp", label: "KTP" },
    { value: "sim", label: "SIM" },
    { value: "paspor", label: "Paspor" },
]

export const identitySchema = z.object({
    id_type: identityTypeSchema,
    id_number: z
        .string()
        .trim()
        .min(1, "Nomor identitas wajib diisi.")
        .max(50, "Nomor identitas maksimal 50 karakter."),
    full_name: z.string().trim().min(1, "Nama lengkap wajib diisi.").max(100, "Nama lengkap maksimal 100 karakter."),
    birth_date: z
        .string()
        .trim()
        .optional()
        .refine((value) => {
            if (value === undefined || value === "") {
                return true
            }

            const date = new Date(value)

            if (Number.isNaN(date.getTime())) {
                return false
            }

            const today = new Date()
            today.setHours(0, 0, 0, 0)

            return date.getTime() < today.getTime()
        }, "Tanggal lahir harus sebelum hari ini."),
})

export type IdentityFormValues = z.infer<typeof identitySchema>
