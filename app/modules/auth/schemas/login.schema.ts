import { z } from "zod"

export const loginSchema = z.object({
    email: z.string().min(1, "Email wajib diisi.").email("Masukkan alamat email yang valid."),
    password: z.string().min(1, "Kata sandi wajib diisi."),
})

export type LoginFormValues = z.infer<typeof loginSchema>
