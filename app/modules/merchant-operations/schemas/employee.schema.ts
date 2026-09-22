import { z } from "zod"

export const outletUserRoleSchema = z.enum(["outlet_manager", "outlet_staff"])

export const employeeSchema = z
    .object({
        email: z
            .string()
            .trim()
            .min(1, "Email wajib diisi.")
            .email("Email tidak valid.")
            .max(100, "Email maksimal 100 karakter."),
        phone: z.string().trim().max(30, "Telepon maksimal 30 karakter.").optional(),
        password: z
            .string()
            .min(8, "Password minimal 8 karakter.")
            .regex(/[A-Za-z]/, "Password harus memuat huruf.")
            .regex(/\d/, "Password harus memuat angka."),
        password_confirmation: z.string(),
        role: outletUserRoleSchema,
    })
    .refine((value) => value.password === value.password_confirmation, {
        message: "Konfirmasi password tidak cocok.",
        path: ["password_confirmation"],
    })

export type EmployeeFormValues = z.infer<typeof employeeSchema>

export function employeePayload(values: EmployeeFormValues) {
    return {
        email: values.email.trim(),
        phone: values.phone === undefined || values.phone.trim() === "" ? null : values.phone.trim(),
        password: values.password,
        password_confirmation: values.password_confirmation,
        role: values.role,
    }
}
