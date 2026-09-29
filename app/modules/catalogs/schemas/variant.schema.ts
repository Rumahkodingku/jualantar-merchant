import { z } from "zod"

import { priceField } from "./fields"

export const variantRowSchema = z.object({
    name: z.string().trim().min(1, "Nama variant wajib diisi.").max(100, "Nama variant maksimal 100 karakter."),
    sku: z.union([z.string().trim().max(50, "SKU maksimal 50 karakter."), z.literal("")]).optional(),
    price: priceField,
    status: z.enum(["active", "inactive"]),
    is_default: z.boolean(),
})

export type VariantRowValues = z.infer<typeof variantRowSchema>
