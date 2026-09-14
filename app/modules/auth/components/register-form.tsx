import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import { PasswordInput } from "~/components/password-input"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import { Field, FieldDescription, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Spinner } from "~/components/ui/spinner"
import { Text } from "~/components/ui/text"
import { ApiError } from "~/lib/api"
import { applyApiFieldErrors, getApiErrorMessage } from "~/lib/api-form"

import { registerSchema, type RegisterFormValues } from "../schemas/register.schema"
import { useRegisterMerchant } from "../services/auth.mutations"
import { Mail, Phone } from "lucide-react"

const FIELDS = ["email", "phone", "password", "password_confirmation", "terms_accepted"] as const

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
        <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
            {formError !== null ? (
                <Alert variant="destructive">
                    <AlertTitle>Tidak dapat mendaftar</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                </Alert>
            ) : null}

            <Field data-invalid={errors.email !== undefined}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <div className="relative">
                    <Mail
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                        id="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="nama@usaha.id"
                        className="h-11 pl-10"
                        aria-invalid={errors.email !== undefined}
                        {...register("email")}
                    />
                </div>
                <FieldDescription>Kami akan mengirim tautan verifikasi ke email ini.</FieldDescription>
                <FieldError errors={errors.email ? [errors.email] : undefined} />
            </Field>

            <Field data-invalid={errors.phone !== undefined}>
                <FieldLabel htmlFor="phone">Nomor telepon</FieldLabel>
                <div className="relative">
                    <Phone
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                    />

                    <Input
                        id="phone"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="081234567890"
                        className="h-11 pl-10"
                        aria-invalid={errors.phone !== undefined}
                        {...register("phone")}
                    />
                </div>

                <FieldError errors={errors.phone ? [errors.phone] : undefined} />
            </Field>

            <Field data-invalid={errors.password !== undefined}>
                <FieldLabel htmlFor="password">Kata sandi</FieldLabel>
                <PasswordInput
                    id="password"
                    autoComplete="new-password"
                    placeholder="Minimal 8 karakter"
                    className="h-11"
                    aria-invalid={errors.password !== undefined}
                    {...register("password")}
                />
                <FieldDescription>Minimal 8 karakter, memuat huruf dan angka.</FieldDescription>
                <FieldError errors={errors.password ? [errors.password] : undefined} />
            </Field>

            <Field data-invalid={errors.password_confirmation !== undefined}>
                <FieldLabel htmlFor="password_confirmation">Konfirmasi kata sandi</FieldLabel>
                <PasswordInput
                    id="password_confirmation"
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
                            <Text as="span" variant="sm" className="leading-relaxed text-muted-foreground">
                                Saya menyetujui{" "}
                                <span className="font-medium text-foreground underline underline-offset-4">
                                    syarat &amp; ketentuan
                                </span>{" "}
                                serta kebijakan privasi JualAntar.
                            </Text>
                        </label>
                    )}
                />
                <FieldError errors={errors.terms_accepted ? [errors.terms_accepted] : undefined} />
            </div>

            <Button
                type="submit"
                size="lg"
                className="mt-1 h-11 w-full text-sm font-semibold"
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
        </form>
    )
}
