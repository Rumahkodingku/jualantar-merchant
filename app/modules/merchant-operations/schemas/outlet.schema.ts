import { z } from "zod"

const emptyToUndefined = (value: unknown) => (value === "" || value === null || value === undefined ? undefined : value)

const regionId = z.coerce.number().int().positive("Pilih wilayah lengkap terlebih dahulu.")

const coordinate = (min: number, max: number) =>
    z.preprocess(
        emptyToUndefined,
        z.coerce.number().min(min, "Koordinat di luar rentang.").max(max, "Koordinat di luar rentang.")
    )

/**
 * General outlet fields only. Operating hours and service area have their own
 * endpoints, and the status is managed through activate/deactivate.
 */
export const outletOperationsSchema = z.object({
    name: z.string().trim().min(1, "Nama outlet wajib diisi.").max(100, "Nama outlet maksimal 100 karakter."),
    phone: z.string().trim().max(20, "Telepon maksimal 20 karakter.").optional(),
    email: z.union([z.string().trim().email("Email tidak valid.").max(100), z.literal("")]).optional(),
    address: z.string().trim().min(1, "Alamat wajib diisi."),
    province_id: regionId,
    regency_id: regionId,
    district_id: regionId,
    village_id: regionId,
    postal_code: z.string().trim().min(1, "Kode pos wajib diisi.").max(10, "Kode pos maksimal 10 karakter."),
    latitude: coordinate(-90, 90),
    longitude: coordinate(-180, 180),
})

export type OutletOperationsFormValues = z.infer<typeof outletOperationsSchema>
