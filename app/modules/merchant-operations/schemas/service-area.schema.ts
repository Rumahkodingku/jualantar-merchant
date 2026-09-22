import { z } from "zod"

export const outletServiceAreaTypeSchema = z.enum(["radius", "province", "regency", "district", "village"])

export type OutletServiceAreaTypeValue = z.infer<typeof outletServiceAreaTypeSchema>

const emptyToUndefined = (value: unknown) => (value === "" || value === null || value === undefined ? undefined : value)

export const serviceAreaSchema = z
    .object({
        type: outletServiceAreaTypeSchema,
        radius_km: z.preprocess(
            emptyToUndefined,
            z.coerce.number().min(0.1, "Radius minimal 0.1 km.").max(999.99, "Radius maksimal 999.99 km.").optional()
        ),
    })
    .superRefine((value, ctx) => {
        if (value.type === "radius" && value.radius_km === undefined) {
            ctx.addIssue({
                code: "custom",
                path: ["radius_km"],
                message: "Radius wajib diisi untuk tipe area radius.",
            })
        }
    })

export type ServiceAreaFormValues = z.infer<typeof serviceAreaSchema>

export const SERVICE_AREA_TYPE_OPTIONS: { value: OutletServiceAreaTypeValue; label: string }[] = [
    { value: "radius", label: "Radius (km)" },
    { value: "province", label: "Provinsi" },
    { value: "regency", label: "Kabupaten/Kota" },
    { value: "district", label: "Kecamatan" },
    { value: "village", label: "Desa/Kelurahan" },
]
