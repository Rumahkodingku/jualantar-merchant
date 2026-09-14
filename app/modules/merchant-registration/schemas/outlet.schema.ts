import { z } from "zod"

import type { DayKey, OperatingHours } from "../types/merchant-registration.types"

export const outletServiceAreaTypeSchema = z.enum(["radius", "province", "regency", "district", "village"])

export const SERVICE_AREA_TYPE_OPTIONS: {
    value: z.infer<typeof outletServiceAreaTypeSchema>
    label: string
}[] = [
    { value: "radius", label: "Radius (km)" },
    { value: "province", label: "Provinsi" },
    { value: "regency", label: "Kabupaten/Kota" },
    { value: "district", label: "Kecamatan" },
    { value: "village", label: "Desa/Kelurahan" },
]

export const DAY_KEYS: DayKey[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

export const DAY_LABELS: Record<DayKey, string> = {
    monday: "Senin",
    tuesday: "Selasa",
    wednesday: "Rabu",
    thursday: "Kamis",
    friday: "Jumat",
    saturday: "Sabtu",
    sunday: "Minggu",
}

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Gunakan format HH:mm.")

export const operatingHourSlotSchema = z
    .object({
        open: timeSchema,
        close: timeSchema,
    })
    .refine((slot) => slot.close > slot.open, {
        message: "Jam tutup harus setelah jam buka.",
        path: ["close"],
    })

const emptyToUndefined = (value: unknown) => (value === "" || value === null || value === undefined ? undefined : value)

const regionId = z.coerce.number().int().positive("Pilih wilayah lengkap terlebih dahulu.")

const coordinate = (min: number, max: number) => z.preprocess(emptyToUndefined, z.coerce.number().min(min).max(max))

export const outletSchema = z
    .object({
        name: z.string().trim().min(1, "Nama outlet wajib diisi.").max(100, "Nama outlet maksimal 100 karakter."),
        phone: z.string().trim().max(20).optional(),
        email: z.union([z.string().trim().email("Email tidak valid."), z.literal("")]).optional(),
        address: z.string().trim().min(1, "Alamat wajib diisi."),
        province_id: regionId,
        regency_id: regionId,
        district_id: regionId,
        village_id: regionId,
        postal_code: z.string().trim().min(1, "Kode pos wajib diisi.").max(10, "Kode pos maksimal 10 karakter."),
        latitude: coordinate(-90, 90),
        longitude: coordinate(-180, 180),
        service_area_type: outletServiceAreaTypeSchema,
        service_radius_km: z.preprocess(emptyToUndefined, z.coerce.number().min(0.1).max(999.99).optional()),
        hours: z.record(z.string(), z.array(operatingHourSlotSchema).min(1, "Tambahkan minimal satu jam.")),
    })
    .superRefine((value, ctx) => {
        if (value.service_area_type === "radius" && value.service_radius_km === undefined) {
            ctx.addIssue({
                code: "custom",
                path: ["service_radius_km"],
                message: "Radius wajib diisi untuk tipe area radius.",
            })
        }
    })

export type OutletFormValues = z.infer<typeof outletSchema>

export function hoursToPayload(hours: OutletFormValues["hours"]): OperatingHours | null {
    const entries = Object.entries(hours)

    if (entries.length === 0) {
        return null
    }

    const payload: OperatingHours = {}

    for (const [day, slots] of entries) {
        payload[day as DayKey] = slots.map((slot) => ({ open: slot.open, close: slot.close }))
    }

    return payload
}
