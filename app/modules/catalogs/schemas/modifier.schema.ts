import { z } from "zod"

import { optionalDescription, priceField } from "./fields"

export const modifierSchema = z.object({
    name: z.string().trim().min(1, "Nama modifier wajib diisi.").max(100, "Nama modifier maksimal 100 karakter."),
    description: optionalDescription,
    price: priceField,
    is_default: z.boolean(),
})

export type ModifierFormValues = z.infer<typeof modifierSchema>

export const modifierGroupSchema = z
    .object({
        name: z.string().trim().min(1, "Nama group wajib diisi.").max(100, "Nama group maksimal 100 karakter."),
        description: optionalDescription,
        selection_type: z.enum(["single", "multiple"], { message: "Tipe seleksi wajib dipilih." }),
        min_selection: z.coerce.number().min(0, "Minimum pilihan tidak boleh negatif."),
        max_selection_raw: z.union([z.literal(""), z.number().int().min(0, "Maksimum pilihan tidak boleh negatif.")]),
        is_required: z.boolean(),
    })
    .superRefine((values, ctx) => {
        const maxSelection = values.max_selection_raw === "" ? null : values.max_selection_raw
        const lowerBound = Math.max(values.min_selection, 1)

        if (values.selection_type === "single") {
            if (maxSelection !== null && maxSelection !== 1) {
                ctx.addIssue({
                    code: "custom",
                    path: ["max_selection_raw"],
                    message: "Tipe seleksi single hanya boleh satu pilihan.",
                })
            }
        } else if (maxSelection !== null && maxSelection < lowerBound) {
            ctx.addIssue({
                code: "custom",
                path: ["max_selection_raw"],
                message: `Maksimum pilihan minimal ${lowerBound}.`,
            })
        }

        if (values.is_required !== values.min_selection >= 1) {
            ctx.addIssue({
                code: "custom",
                path: ["is_required"],
                message: "Group wajib dipilih harus mengikuti minimum pilihan (minimal 1).",
            })
        }

        if (!values.is_required && values.min_selection !== 0) {
            ctx.addIssue({
                code: "custom",
                path: ["is_required"],
                message: "Group yang tidak wajib dipilih harus memiliki minimum pilihan 0.",
            })
        }

        if (values.selection_type === "single" && values.min_selection > 1) {
            ctx.addIssue({
                code: "custom",
                path: ["is_required"],
                message: "Tipe single hanya boleh wajib (1) atau opsional (0).",
            })
        }
    })

export type ModifierGroupFormValues = z.infer<typeof modifierGroupSchema>
