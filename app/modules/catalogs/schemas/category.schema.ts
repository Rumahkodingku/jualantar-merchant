import { z } from "zod"

import { optionalDescription } from "./fields"

export const categorySchema = z.object({
    name: z.string().trim().min(1, "Nama kategori wajib diisi.").max(100, "Nama kategori maksimal 100 karakter."),
    description: optionalDescription,
})

export type CategoryFormValues = z.infer<typeof categorySchema>
