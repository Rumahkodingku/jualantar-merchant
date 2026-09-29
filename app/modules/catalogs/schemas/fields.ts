import { z } from "zod"

/**
 * The text fields shared by every catalog form. An empty description is a real
 * state — the merchant has not written one — and the API wants that as `null`
 * rather than an empty string, so the transform lives with the field instead of
 * in every dialog that happens to hold a description.
 */
const optionalDescription = z
    .union([z.string().trim().max(500, "Deskripsi maksimal 500 karakter."), z.literal("")])
    .optional()
    .transform((value) => (value === "" ? null : value))

/** A price typed as a string or a number, but never blank and never negative. */
const priceField = z.coerce.number({ message: "Harga wajib diisi." }).min(0, "Harga tidak boleh negatif.")

export { optionalDescription, priceField }
