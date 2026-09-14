import { z } from "zod"

export const payoutSchema = z.object({
    bank_id: z.coerce.number().int().positive("Pilih bank terlebih dahulu."),
    account_number: z
        .string()
        .trim()
        .min(1, "Nomor rekening wajib diisi.")
        .max(50, "Nomor rekening maksimal 50 karakter."),
    account_name: z
        .string()
        .trim()
        .min(1, "Nama pemilik rekening wajib diisi.")
        .max(150, "Nama pemilik rekening maksimal 150 karakter."),
})

export type PayoutFormValues = z.infer<typeof payoutSchema>
