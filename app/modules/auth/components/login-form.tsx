import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate, useSearchParams } from "react-router"

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
    })

    const redirectTo = searchParams.get("redirect") ?? "/merchant/registration"

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
                <FieldError errors={errors.email ? [errors.email] : undefined} />
            </Field>

            <Field>
                <FieldLabel htmlFor="password">Kata sandi</FieldLabel>
                <Input
                    id="password"
                    type="password"
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
