import { z } from "zod"

import { optionalDescription } from "./fields"

export const productInfoSchema = z.object({
    name: z.string().trim().min(1, "Nama produk wajib diisi.").max(150, "Nama produk maksimal 150 karakter."),
    category_id: z.string().min(1, "Kategori wajib dipilih."),
    description: optionalDescription,
    product_type: z.enum(["simple", "variable"], { message: "Tipe produk wajib dipilih." }),
})

export type ProductInfoFormValues = z.infer<typeof productInfoSchema>

const emptyToUndefined = (value: unknown) => (value === "" || value === null || value === undefined ? undefined : value)

export const simplePriceSchema = z.object({
    price: z.preprocess(
        emptyToUndefined,
        z.coerce
            .number({ message: "Harga wajib diisi." })
            .min(0, "Harga tidak boleh negatif.")
            .max(Number.MAX_SAFE_INTEGER, "Harga terlalu besar.")
    ),
})

export type SimplePriceFormValues = z.infer<typeof simplePriceSchema>
