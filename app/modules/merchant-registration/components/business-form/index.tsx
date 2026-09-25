import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert"
import { Field, FieldDescription, FieldError, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { ChoiceCards } from "~/components/ui/choice-cards"
import { FormActions } from "~/components/form-actions"
import { useRegistrationContext } from "../registration-context"
import { businessSchema, MERCHANT_TYPE_OPTIONS, type BusinessFormValues } from "../../schemas/business.schema"
import { useUpdateBusinessProfile } from "../../services/merchant-registration.mutations"
import { applyApiFieldErrors, getApiErrorMessage } from "../../utils/api-error"
import { BriefcaseBusiness } from "lucide-react"

const FIELDS = ["business_name", "type", "description"] as const

export function BusinessForm() {
    const { registration, navigation } = useRegistrationContext()
    const mutation = useUpdateBusinessProfile()

    const {
        control,
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<BusinessFormValues>({
        resolver: zodResolver(businessSchema),
        defaultValues: {
            business_name: registration.business_name ?? "",
            type: registration.type ?? "individual",
            description: registration.description ?? "",
        },
    })

    const onSubmit = handleSubmit((values) => {
        mutation.mutate(values, {
            onSuccess: () => navigation.goNext(),
            onError: (error) => {
                const applied = applyApiFieldErrors(error, setError, FIELDS)
                if (!applied) {
                    setError("root", {
                        message: getApiErrorMessage(error),
                    })
                }
            },
        })
    })

    return (
        <form id="business-form" onSubmit={onSubmit} className="flex flex-1 flex-col" noValidate>
            <div className="flex flex-1 flex-col gap-5">
                {errors.root?.message !== undefined ? (
                    <Alert variant="destructive">
                        <AlertTitle>Gagal menyimpan</AlertTitle>
                        <AlertDescription>{errors.root.message}</AlertDescription>
                    </Alert>
                ) : null}

                <Field>
                    <FieldLabel htmlFor="business_name">
                        Nama usaha <span className="text-red-600">*</span>
                    </FieldLabel>
                    <div className="relative">
                        <BriefcaseBusiness
                            aria-hidden="true"
                            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                        />

                        <Input
                            id="business_name"
                            className="h-11 pl-10"
                            placeholder="Contoh: Warung Sari"
                            aria-invalid={errors.business_name !== undefined}
                            {...register("business_name")}
                        />
                    </div>
                    <FieldError errors={errors.business_name ? [errors.business_name] : undefined} />
                </Field>

                <Field>
                    <FieldLabel>
                        Jenis usaha <span className="text-red-600">*</span>
                    </FieldLabel>
                    <Controller
                        control={control}
                        name="type"
                        render={({ field }) => (
                            <ChoiceCards
                                options={MERCHANT_TYPE_OPTIONS}
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <FieldError errors={errors.type ? [errors.type] : undefined} />
                </Field>

                <Field>
                    <FieldLabel htmlFor="description">
                        Deskripsi <span className="font-normal text-muted-foreground">(opsional)</span>
                    </FieldLabel>
                    <Textarea
                        id="description"
                        rows={4}
                        placeholder="Ceritakan singkat tentang usaha Anda"
                        aria-invalid={errors.description !== undefined}
                        {...register("description")}
                    />
                    <FieldDescription>Maksimal 1000 karakter.</FieldDescription>
                    <FieldError errors={errors.description ? [errors.description] : undefined} />
                </Field>
            </div>

            <FormActions
                form="business-form"
                isSubmitting={mutation.isPending}
                onBack={navigation.isFirst ? undefined : navigation.goBack}
            />
        </form>
    )
}
