import { z } from "zod"

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Gunakan format HH:mm.")

export const operatingHoursSchema = z.object({
    hours: z.record(
        z.string(),
        z
            .object({
                is_open: z.literal(true),
                open: timeSchema,
                close: timeSchema,
            })
            .refine((day) => day.close > day.open, {
                message: "Jam tutup harus setelah jam buka.",
                path: ["close"],
            })
    ),
})

export type OperatingHoursFormValues = z.infer<typeof operatingHoursSchema>
