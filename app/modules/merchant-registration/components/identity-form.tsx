import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Field, FieldDescription, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"

import { ChoiceCards } from "./choice-cards"
import { RegistrationActions } from "./registration-actions"
import { useRegistrationContext } from "./registration-context"
import { IDENTITY_TYPE_OPTIONS, identitySchema, type IdentityFormValues } from "../schemas/identity.schema"
import { useSaveIdentity } from "../services/merchant-registration.mutations"
import { applyApiFieldErrors, getApiErrorMessage } from "../utils/api-error"

const FIELDS = ["id_type", "id_number", "full_name", "birth_date"] as const

export function IdentityForm() {
    const { registration, navigation } = useRegistrationContext()
    const mutation = useSaveIdentity()
    const identity = registration.identity

    const {
        control,
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<IdentityFormValues>({
        resolver: zodResolver(identitySchema),
        defaultValues: {
            id_type: identity?.id_type ?? "ktp",
            id_number: identity?.id_number ?? "",
            full_name: identity?.full_name ?? "",
            birth_date: identity?.birth_date ?? "",
        },
    })

    const onSubmit = handleSubmit((values) => {
        mutation.mutate(
            {
                ...values,
                birth_date: values.birth_date === "" ? null : (values.birth_date ?? null),
            },
            {
                onSuccess: () => navigation.goNext(),
                onError: (error) => {
                    const applied = applyApiFieldErrors(error, setError, FIELDS)

                    if (!applied) {
                        setError("root", { message: getApiErrorMessage(error) })
                    }
                },
            }
        )
    })

    return (
        <form id="identity-form" onSubmit={onSubmit} className="flex flex-1 flex-col" noValidate>
            <div className="flex flex-1 flex-col gap-5">
                {errors.root?.message !== undefined ? (
                    <Alert variant="destructive">
                        <AlertTitle>Gagal menyimpan</AlertTitle>
                        <AlertDescription>{errors.root.message}</AlertDescription>
                    </Alert>
                ) : null}

                <Field>
                    <FieldLabel>Jenis identitas</FieldLabel>
                    <Controller
                        control={control}
                        name="id_type"
                        render={({ field }) => (
                            <ChoiceCards
                                options={IDENTITY_TYPE_OPTIONS}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <FieldError errors={errors.id_type ? [errors.id_type] : undefined} />
                </Field>

                <Field>
                    <FieldLabel htmlFor="id_number">Nomor identitas</FieldLabel>
                    <Input
                        id="id_number"
                        className="h-11"
                        inputMode="numeric"
                        placeholder="Sesuai dokumen"
                        aria-invalid={errors.id_number !== undefined}
                        {...register("id_number")}
                    />
                    <FieldError errors={errors.id_number ? [errors.id_number] : undefined} />
                </Field>

                <Field>
                    <FieldLabel htmlFor="full_name">Nama lengkap</FieldLabel>
                    <Input
                        id="full_name"
                        className="h-11"
                        placeholder="Sesuai dokumen identitas"
                        aria-invalid={errors.full_name !== undefined}
                        {...register("full_name")}
                    />
                    <FieldError errors={errors.full_name ? [errors.full_name] : undefined} />
                </Field>

                <Field>
                    <FieldLabel htmlFor="birth_date">
                        Tanggal lahir <span className="font-normal text-muted-foreground">(opsional)</span>
                    </FieldLabel>
                    <Input
                        id="birth_date"
                        type="date"
                        className="h-11"
                        max={new Date().toISOString().slice(0, 10)}
                        aria-invalid={errors.birth_date !== undefined}
                        {...register("birth_date")}
                    />
                    <FieldDescription>Harus sebelum hari ini.</FieldDescription>
                    <FieldError errors={errors.birth_date ? [errors.birth_date] : undefined} />
                </Field>
            </div>

            <RegistrationActions form="identity-form" isSubmitting={mutation.isPending} onBack={navigation.goBack} />
        </form>
    )
}
