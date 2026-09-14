import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useNavigate } from "react-router"

import { ActionBar } from "~/components/layouts/action-bar"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Field, FieldDescription, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Spinner } from "~/components/ui/spinner"
import { ApiError } from "~/lib/api"
import { applyApiFieldErrors, getApiErrorMessage } from "~/lib/api-form"

import { registerSchema, type RegisterFormValues } from "../schemas/register.schema"
import { useRegisterMerchant } from "../services/auth.mutations"

const FIELDS = ["email", "phone", "full_name", "password", "password_confirmation", "terms_accepted"] as const

export function RegisterForm() {
    const navigate = useNavigate()
    const mutation = useRegisterMerchant()
    const [formError, setFormError] = useState<string | null>(null)

    const {
        control,
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            full_name: "",
            email: "",
            phone: "",
            password: "",
            password_confirmation: "",
            terms_accepted: false,
        },
    })

    const onSubmit = handleSubmit((values) => {
        setFormError(null)

        mutation.mutate(values, {
            onSuccess: (registered) => {
                void navigate(`/merchant/check-email?email=${encodeURIComponent(registered.email)}`, { replace: true })
            },
            onError: (error) => {
                const applied = applyApiFieldErrors(error, setError, FIELDS)

                if (!applied) {
                    setFormError(
                        error instanceof ApiError && error.status === 429
                            ? "Terlalu banyak percobaan. Coba lagi beberapa saat."
                            : getApiErrorMessage(error)
                    )
                }
            },
        })
    })

    return (
        <form id="register-form" onSubmit={onSubmit} className="flex flex-1 flex-col" noValidate>
            <div className="flex flex-1 flex-col gap-5 px-6 py-6">
                {formError !== null ? (
                    <Alert variant="destructive">
                        <AlertTitle>Tidak dapat mendaftar</AlertTitle>
                        <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                ) : null}

                <Field>
                    <FieldLabel htmlFor="full_name">Nama lengkap</FieldLabel>
                    <Input
                        id="full_name"
                        className="h-11"
                        autoComplete="name"
                        placeholder="Sesuai identitas"
                        aria-invalid={errors.full_name !== undefined}
                        {...register("full_name")}
                    />
                    <FieldError errors={errors.full_name ? [errors.full_name] : undefined} />
                </Field>

                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="nama@usaha.id"
                        className="h-11"
                        aria-invalid={errors.email !== undefined}
                        {...register("email")}
                    />
                    <FieldDescription>Kami akan mengirim tautan verifikasi ke email ini.</FieldDescription>
                    <FieldError errors={errors.email ? [errors.email] : undefined} />
                </Field>

                <Field>
                    <FieldLabel htmlFor="phone">Nomor telepon</FieldLabel>
                    <Input
                        id="phone"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="081234567890"
                        className="h-11"
                        aria-invalid={errors.phone !== undefined}
                        {...register("phone")}
                    />
                    <FieldError errors={errors.phone ? [errors.phone] : undefined} />
                </Field>

                <Field>
                    <FieldLabel htmlFor="password">Kata sandi</FieldLabel>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Minimal 8 karakter"
                        className="h-11"
                        aria-invalid={errors.password !== undefined}
                        {...register("password")}
                    />
                    <FieldDescription>Minimal 8 karakter, memuat huruf dan angka.</FieldDescription>
                    <FieldError errors={errors.password ? [errors.password] : undefined} />
                </Field>

                <Field>
                    <FieldLabel htmlFor="password_confirmation">Konfirmasi kata sandi</FieldLabel>
                    <Input
                        id="password_confirmation"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Ulangi kata sandi"
                        className="h-11"
                        aria-invalid={errors.password_confirmation !== undefined}
                        {...register("password_confirmation")}
                    />
                    <FieldError errors={errors.password_confirmation ? [errors.password_confirmation] : undefined} />
                </Field>

                <div className="flex flex-col gap-2">
                    <Controller
                        control={control}
                        name="terms_accepted"
                        render={({ field }) => (
                            <label className="flex cursor-pointer items-start gap-3">
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={(checked) => field.onChange(checked === true)}
                                    className="mt-0.5"
                                />
                                <span className="text-sm leading-relaxed text-muted-foreground">
                                    Saya menyetujui{" "}
                                    <span className="font-medium text-foreground underline underline-offset-4">
                                        syarat &amp; ketentuan
                                    </span>{" "}
                                    serta kebijakan privasi JualAntar.
                                </span>
                            </label>
                        )}
                    />
                    <FieldError errors={errors.terms_accepted ? [errors.terms_accepted] : undefined} />
                </div>
            </div>

            <ActionBar>
                <Button
                    type="submit"
                    form="register-form"
                    size="lg"
                    className="h-11 w-full text-sm"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? (
                        <>
                            <Spinner /> Mendaftar…
                        </>
                    ) : (
                        "Daftar"
                    )}
                </Button>
            </ActionBar>
        </form>
    )
}
