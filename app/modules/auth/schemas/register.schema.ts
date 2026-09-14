import { z } from "zod"

const phonePattern = /^(\+62|62|0)8[0-9]{7,13}$/

export const registerSchema = z
    .object({
        full_name: z
            .string()
            .trim()
            .min(1, "Nama lengkap wajib diisi.")
            .max(150, "Nama lengkap maksimal 150 karakter."),
        email: z
            .string()
            .trim()
            .min(1, "Email wajib diisi.")
            .email("Masukkan alamat email yang valid.")
            .max(100, "Email maksimal 100 karakter."),
        phone: z
            .string()
            .trim()
            .min(1, "Nomor telepon wajib diisi.")
            .regex(phonePattern, "Gunakan nomor Indonesia, contoh 081234567890."),
        password: z
            .string()
            .min(8, "Kata sandi minimal 8 karakter.")
            .regex(/[A-Za-z]/, "Kata sandi harus memuat huruf.")
            .regex(/[0-9]/, "Kata sandi harus memuat angka."),
        password_confirmation: z.string().min(1, "Konfirmasi kata sandi wajib diisi."),
        terms_accepted: z.boolean().refine((value) => value, "Anda harus menyetujui syarat & ketentuan."),
    })
    .refine((data) => data.password === data.password_confirmation, {
        path: ["password_confirmation"],
        message: "Konfirmasi kata sandi tidak sama.",
    })

export type RegisterFormValues = z.infer<typeof registerSchema>
