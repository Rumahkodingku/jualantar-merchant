import { zodResolver } from "@hookform/resolvers/zod"
import { Mail } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate, useSearchParams } from "react-router"

import { PasswordInput } from "~/components/password-input"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Button } from "~/components/ui/button"
import { Field, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Spinner } from "~/components/ui/spinner"
import { ApiError } from "~/lib/api"

import { loginSchema, type LoginFormValues } from "../schemas/login.schema"
import { useLogin } from "../services/auth.mutations"

export function LoginForm() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const loginMutation = useLogin()
    const [formError, setFormError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
        mode: "onBlur",
    })

    const redirectTo = searchParams.get("redirect") ?? "/"

    function onSubmit(values: LoginFormValues) {
        setFormError(null)

        loginMutation.mutate(values, {
            onSuccess: () => navigate(redirectTo, { replace: true }),
            onError: (error) => {
                if (error instanceof ApiError) {
                    if (error.code === "email_not_verified") {
                        setFormError("Email belum diverifikasi. Cek kotak masuk Anda, lalu coba masuk lagi.")
                    } else if (error.code === "invalid_credentials") {
                        setFormError("Email atau kata sandi salah.")
                    } else {
                        setFormError(error.detail)
                    }
                    return
                }

                setFormError("Tidak dapat masuk. Silakan coba lagi.")
            },
        })
    }

    const isSubmitting = loginMutation.isPending

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
            {formError !== null ? (
                <Alert variant="destructive">
                    <AlertTitle>Tidak dapat masuk</AlertTitle>
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
                <FieldError errors={errors.email ? [errors.email] : undefined} />
            </Field>

            <Field data-invalid={errors.password !== undefined}>
                <FieldLabel htmlFor="password">Kata sandi</FieldLabel>
                <PasswordInput
                    id="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-11"
                    aria-invalid={errors.password !== undefined}
                    {...register("password")}
                />
                <FieldError errors={errors.password ? [errors.password] : undefined} />
            </Field>

            <Button type="submit" size="lg" className="mt-1 h-11 w-full text-sm" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Spinner /> Memproses…
                    </>
                ) : (
                    "Masuk"
                )}
            </Button>
        </form>
    )
}
