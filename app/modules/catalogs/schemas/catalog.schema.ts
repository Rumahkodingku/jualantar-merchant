import { z } from "zod"

const emptyToUndefined = (value: unknown) => (value === "" || value === null || value === undefined ? undefined : value)

export const productInfoSchema = z.object({
    name: z.string().trim().min(1, "Nama produk wajib diisi.").max(150, "Nama produk maksimal 150 karakter."),
    category_id: z.string().min(1, "Kategori wajib dipilih."),
    description: z
        .union([z.string().trim().max(500, "Deskripsi maksimal 500 karakter."), z.literal("")])
        .optional()
        .transform((value) => (value === "" ? null : value)),
    product_type: z.enum(["simple", "variable"], { message: "Tipe produk wajib dipilih." }),
})

export type ProductInfoFormValues = z.infer<typeof productInfoSchema>

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

export const variantRowSchema = z.object({
    name: z.string().trim().min(1, "Nama variant wajib diisi.").max(100, "Nama variant maksimal 100 karakter."),
    sku: z.union([z.string().trim().max(50, "SKU maksimal 50 karakter."), z.literal("")]).optional(),
    price: z.coerce.number({ message: "Harga wajib diisi." }).min(0, "Harga tidak boleh negatif."),
    status: z.enum(["active", "inactive"]),
    is_default: z.boolean(),
})

export type VariantRowValues = z.infer<typeof variantRowSchema>

export const categorySchema = z.object({
    name: z.string().trim().min(1, "Nama kategori wajib diisi.").max(100, "Nama kategori maksimal 100 karakter."),
    description: z
        .union([z.string().trim().max(500, "Deskripsi maksimal 500 karakter."), z.literal("")])
        .optional()
        .transform((value) => (value === "" ? null : value)),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

export const modifierGroupSchema = z
    .object({
        name: z.string().trim().min(1, "Nama group wajib diisi.").max(100, "Nama group maksimal 100 karakter."),
        description: z
            .union([z.string().trim().max(500, "Deskripsi maksimal 500 karakter."), z.literal("")])
            .optional()
            .transform((value) => (value === "" ? null : value)),
        selection_type: z.enum(["single", "multiple"], { message: "Tipe seleksi wajib dipilih." }),
        min_selection: z.coerce.number().min(0, "Minimum pilihan tidak boleh negatif."),
        max_selection_raw: z.union([z.coerce.number().min(0, "Maksimum pilihan tidak boleh negatif."), z.literal("")]),
        is_required: z.boolean(),
    })
    .superRefine((values, ctx) => {
        const maxSelection = values.max_selection_raw === "" ? null : values.max_selection_raw

        if (maxSelection !== null && maxSelection < values.min_selection) {
            ctx.addIssue({
                code: "custom",
                path: ["max_selection_raw"],
                message: "Maksimum pilihan harus lebih besar atau sama dengan minimum.",
            })
        }

        if (values.is_required && values.min_selection < 1) {
            ctx.addIssue({
                code: "custom",
                path: ["min_selection"],
                message: "Group wajib memiliki minimum pilihan minimal 1.",
            })
        }
    })

export type ModifierGroupFormValues = z.infer<typeof modifierGroupSchema>

export const modifierSchema = z.object({
    name: z.string().trim().min(1, "Nama modifier wajib diisi.").max(100, "Nama modifier maksimal 100 karakter."),
    description: z
        .union([z.string().trim().max(500, "Deskripsi maksimal 500 karakter."), z.literal("")])
        .optional()
        .transform((value) => (value === "" ? null : value)),
    price: z.coerce.number({ message: "Harga wajib diisi." }).min(0, "Harga tidak boleh negatif."),
    is_default: z.boolean(),
})

export type ModifierFormValues = z.infer<typeof modifierSchema>
